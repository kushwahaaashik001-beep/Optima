import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // 1. Signature Verify karne ke liye string banana
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // 2. Apne Secret Key se HMAC hash generate karna
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    // 3. Match karna ki signature sahi hai ya nahi
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // ✅ SUCCESS: Yahan aap user ka database update kar sakte ho
      // Example: await db.user.update({ where: { id: userId }, data: { isPro: true } });
      
      console.log("Payment Verified for Order:", razorpay_order_id);
      return NextResponse.json({ 
        message: "Payment verified successfully", 
        success: true 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        message: "Invalid signature, verification failed", 
        success: false 
      }, { status: 400 });
    }
  } catch (err) {
    console.error("Verification Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
