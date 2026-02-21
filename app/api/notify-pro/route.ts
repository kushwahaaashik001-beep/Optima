import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, apply_link } = body; // Nayi lead ki details

    // 1. Fetch only PRO users who have email or telegram_id
    const { data: proUsers, error } = await supabaseAdmin
      .from('profiles')
      .select('email, telegram_id')
      .eq('plan', 'PRO');

    if (error) throw error;
    if (!proUsers || proUsers.length === 0) {
      return NextResponse.json({ success: true, message: "No PRO users found to notify." });
    }

    // 2. Setup Email Transporter (Gmail App Password)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS_KEY, // Gmail App Password
      },
    });

    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    
    // Arrays to hold all sending tasks
    const emailTasks: any[] = [];
    const telegramTasks: any[] = [];

    const tgMessage = `🚀 *New Priority Lead!*\n\n*Title:* ${title}\n*Details:* ${description.substring(0, 100)}...\n\n👉 [Apply Now](${apply_link})`;

    // 3. Loop through PRO users and queue messages
    for (const user of proUsers) {
      // Queue Email
      if (user.email) {
        emailTasks.push(
          transporter.sendMail({
            from: `"Optima Pro Leads" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `🚀 New VIP Lead: ${title}`,
            html: `<h3>New Lead Available</h3><p><b>Title:</b> ${title}</p><p><b>Details:</b> ${description}</p><a href="${apply_link}" style="background:blue;color:white;padding:10px;text-decoration:none;border-radius:5px;">Apply Now</a>`
          })
        );
      }

      // Queue Telegram Message
      if (user.telegram_id && telegramBotToken) {
        const tgUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
        telegramTasks.push(
          fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegram_id,
              text: tgMessage,
              parse_mode: 'Markdown',
              disable_web_page_preview: true
            })
          })
        );
      }
    }

    // 4. Fire all messages simultaneously (Ultra-fast execution)
    await Promise.allSettled([...emailTasks, ...telegramTasks]);

    return NextResponse.json({ success: true, message: `Notified ${proUsers.length} PRO users instantly.` });

  } catch (error) {
    console.error("Notification Error:", error);
    return NextResponse.json({ success: false, error: "Failed to send notifications" }, { status: 500 });
  }
}
