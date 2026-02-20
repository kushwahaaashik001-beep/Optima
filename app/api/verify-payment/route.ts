import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text(); // Raw body zaruri hai signature verification ke liye
    const signature = req.headers.get("x-razorpay-signature"); // Webhook signature header se milta hai
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    // Signature Verify Logic
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature === signature) {
      const event = JSON.parse(bodyText);
      
      if (event.event === "payment.captured") {
        const paymentDetails = event.payload.payment.entity;
        const orderId = paymentDetails.order_id;

        // ✅ SUCCESS: Yahan user ko database mein update karo
        console.log("Webhook Success: Order ID", orderId);
        
        // Example: await updateUserToPro(orderId);
      }
      
      return NextResponse.json({ status: "ok" });
    } else {
      return NextResponse.json({ status: "failed" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
