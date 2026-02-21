import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client (Service Role Key zaruri hai bypass karne ke liye)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Ye key Supabase Settings > API mein milegi
);

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    // 1. Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ status: "failed", message: "Invalid Signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    // 2. Payment Successful Event handle karna
    if (event.event === "payment.captured") {
      const paymentDetails = event.payload.payment.entity;
      const userEmail = paymentDetails.email; // Razorpay se email milta hai

      console.log(`✅ Payment received from: ${userEmail}`);

      // 3. Database mein User ko PRO mark karna
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          plan: 'PRO', 
          updated_at: new Date() 
        })
        .eq('email', userEmail); // Email ke basis par update

      if (error) {
        console.error("❌ Supabase Update Error:", error);
        return NextResponse.json({ error: "DB Update Failed" }, { status: 500 });
      }

      console.log(`🚀 User ${userEmail} upgraded to PRO successfully!`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return NextResponse.json({ error: "Webhook Internal Error" }, { status: 500 });
  }
}
