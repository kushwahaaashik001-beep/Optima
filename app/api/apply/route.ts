import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 1. Secure Authentication Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access. Please login." }, { status: 401 });
    }

    // 2. Fetch User Profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('plan, daily_credits')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ success: false, error: "Profile data not found." }, { status: 404 });
    }

    // 3. Pro User Logic (Direct Access)
    if (profile.plan === 'PRO') {
      return NextResponse.json({ 
        success: true, 
        allowed: true, 
        message: "Pro access granted." 
      });
    }

    // 4. Free User Logic (Credit Check & Deduct)
    if (profile.plan === 'FREE' && profile.daily_credits > 0) {
      // Supabase mein se 1 credit minus karo
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ daily_credits: profile.daily_credits - 1 })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        success: true, 
        allowed: true, 
        remaining: profile.daily_credits - 1,
        message: "Credit used." 
      });
    }

    // 5. If limit reached
    return NextResponse.json({ 
      success: false, 
      allowed: false, 
      message: "Daily limit reached. Upgrade to Pro." 
    }, { status: 403 });

  } catch (error) {
    console.error("Apply API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
