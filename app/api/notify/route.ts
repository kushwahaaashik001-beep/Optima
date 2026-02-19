import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendLeadNotification } from '@/lib/notifications';
import type { LeadNotification } from '@/lib/notifications';

// Define expected lead shape (matches LeadNotification but allows number for budget)
const leadSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().optional(),
  budget: z.union([z.string(), z.number()]).optional(),
  skill: z.string().optional(),
});

// Request body validation schema
const requestSchema = z.object({
  secret: z.string().min(1),
  lead: leadSchema,
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID?.() || Math.random().toString(36).substring(2);

  try {
    // 1. Parse JSON body safely
    const body = await req.json().catch(() => {
      throw new Error('Invalid JSON payload');
    });

    // 2. Validate request body with Zod
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      console.warn(`[${requestId}] Validation failed:`, validation.error.format());
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { secret, lead } = validation.data;

    // 3. Security: check secret
    if (secret !== process.env.NOTIFY_SECRET) {
      console.warn(`[${requestId}] Unauthorized attempt with secret: ${secret}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 4. Transform lead to match LeadNotification type (ensure budget is string)
    const notificationLead: LeadNotification = {
      id: lead.id,
      title: lead.title,
      company: lead.company,
      description: lead.description,
      url: lead.url,
      // Convert budget to string if it's a number
      budget: lead.budget !== undefined ? String(lead.budget) : undefined,
      skill: lead.skill,
    };

    // 5. Fire notification
    await sendLeadNotification(notificationLead);

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Notification sent for lead ${lead.id} in ${duration}ms`);

    return NextResponse.json(
      {
        success: true,
        message: 'Notifications dispatched to pro users',
        leadId: lead.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error after ${duration}ms:`, error.message);

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Optional: handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
