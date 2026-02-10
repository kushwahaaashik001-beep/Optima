import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per user
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Check rate limiting
    const userId = session.user.id;
    const rateLimitKey = `user:${userId}`;
    const now = Date.now();
    
    let rateLimit = rateLimitStore.get(rateLimitKey);
    if (!rateLimit) {
      rateLimit = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
      rateLimitStore.set(rateLimitKey, rateLimit);
    }
    
    // Reset if window has passed
    if (now > rateLimit.resetTime) {
      rateLimit.count = 0;
      rateLimit.resetTime = now + RATE_LIMIT_WINDOW;
    }
    
    // Check if rate limit exceeded
    if (rateLimit.count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - now) / 1000).toString()
          }
        }
      );
    }
    
    // Increment rate limit counter
    rateLimit.count++;
    rateLimitStore.set(rateLimitKey, rateLimit);

    // Get request data
    const body = await request.json();
    const { leadId, customInstructions, tone, length } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Fetch lead details
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Check user subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .single();

    if (!profile?.is_pro) {
      return NextResponse.json(
        { error: 'AI Pitch is a Pro feature. Upgrade to access.' },
        { status: 403 }
      );
    }

    // Prepare context for AI
    const context = `
      Job Title: ${lead.title}
      Company: ${lead.company}
      Location: ${lead.location}
      Requirements: ${lead.requirements.join(', ')}
      Job Description: ${lead.description.substring(0, 1000)}
      User Instructions: ${customInstructions || ''}
      Desired Tone: ${tone || 'professional'}
      Desired Length: ${length || 'medium'}
    `;

    // Generate pitch using Groq AI
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert job application assistant. Generate a compelling, personalized pitch for the given job opportunity.
          
          Guidelines:
          1. Keep it professional but engaging
          2. Highlight relevant skills from requirements
          3. Show enthusiasm for the company/role
          4. Include specific examples when possible
          5. End with a strong call-to-action
          
          Structure:
          - Opening: Greeting and position interest
          - Body: Relevant experience and skills
          - Connection: Why you're interested in this company
          - Closing: Call to action and availability
          
          Tone: ${tone || 'professional'}
          Length: ${length === 'short' ? '100 words' : length === 'long' ? '300 words' : '200 words'}`
        },
        {
          role: "user",
          content: context
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: length === 'short' ? 300 : length === 'long' ? 700 : 500,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.2,
      stream: false,
    });

    const pitch = completion.choices[0]?.message?.content || '';

    // Log the pitch generation
    await supabase.from('pitch_generations').insert({
      user_id: userId,
      lead_id: leadId,
      pitch_content: pitch,
      tone: tone || 'professional',
      length: length || 'medium',
      tokens_used: completion.usage?.total_tokens || 0,
    });

    // Update lead with pitch generated flag
    await supabase
      .from('leads')
      .update({ ai_pitch_generated: true })
      .eq('id', leadId);

    // Add rate limit headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
      'X-RateLimit-Remaining': (RATE_LIMIT_MAX - rateLimit.count).toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.toString(),
    });

    return NextResponse.json(
      { 
        success: true, 
        pitch,
        usage: completion.usage,
        lead: {
          title: lead.title,
          company: lead.company,
          location: lead.location
        }
      },
      { headers }
    );

  } catch (error: any) {
    console.error('Error generating pitch:', error);
    
    // Handle specific errors
    if (error?.code === 'GROQ_API_KEY_NOT_SET') {
      return NextResponse.json(
        { error: 'AI service configuration error. Please contact support.' },
        { status: 500 }
      );
    }
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'AI service rate limit exceeded. Please try again in a few moments.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate pitch. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate pitches.' },
    { status: 405 }
  );
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime + 5 * 60 * 1000) { // 5 minutes after reset
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000); // Every 10 minutes
