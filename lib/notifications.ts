import nodemailer from 'nodemailer';

/**
 * Lead interface – matches your lead structure
 */
export interface LeadData {
  id: string;
  title: string;
  company: string;
  description: string;
  url?: string;
  budget?: string;
  skill?: string;
}

/**
 * Send instant notifications (Telegram + Email) for a new lead.
 * Designed for Pro users to receive alerts within seconds.
 */
export async function sendLeadNotification(lead: LeadData): Promise<void> {
  // Load environment variables
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  // Validate required credentials (fail silently in production, but log error)
  if (!telegramToken || !telegramChatId || !gmailUser || !gmailPass) {
    console.error('❌ Missing notification credentials. Check your environment variables.');
    return;
  }

  // Run notifications in parallel – never block the main flow
  await Promise.allSettled([
    sendTelegramNotification(lead, telegramToken, telegramChatId),
    sendEmailNotification(lead, gmailUser, gmailPass),
  ]);
}

/**
 * Send a beautifully formatted Telegram alert
 */
async function sendTelegramNotification(
  lead: LeadData,
  token: string,
  chatId: string
): Promise<void> {
  const message = `
🚀 <b>🔥 New Pro Lead Just Dropped!</b>

<b>📌 Title:</b> ${escapeHtml(lead.title)}
<b>🏢 Company:</b> ${escapeHtml(lead.company)}
<b>💰 Budget:</b> ${lead.budget || 'Not specified'}
<b>🔧 Skill:</b> ${lead.skill || 'N/A'}

📝 <b>Description Preview:</b>
${escapeHtml(lead.description.substring(0, 200))}${lead.description.length > 200 ? '…' : ''}

👉 <a href="https://yourapp.com/leads/${lead.id}">Open in Dashboard</a>
  `;

  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: false,
  };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Telegram API error:', errorText);
    } else {
      console.log('✅ Telegram notification sent for lead:', lead.id);
    }
  } catch (error) {
    console.error('❌ Telegram fetch failed:', error);
  }
}

/**
 * Send a rich HTML email alert via Gmail SMTP (nodemailer)
 */
async function sendEmailNotification(
  lead: LeadData,
  user: string,
  pass: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f6f9; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; }
        .field-label { font-weight: 600; color: #333; display: block; margin-bottom: 5px; }
        .field-value { background: #f9f9f9; padding: 12px; border-radius: 8px; border-left: 4px solid #667eea; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; color: #999; font-size: 12px; padding: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ New High‑Quality Lead</h1>
          <p style="opacity:0.9;">Act fast – it's fresh!</p>
        </div>
        <div class="content">
          <div class="field">
            <span class="field-label">📌 Title</span>
            <div class="field-value">${escapeHtml(lead.title)}</div>
          </div>
          <div class="field">
            <span class="field-label">🏢 Company</span>
            <div class="field-value">${escapeHtml(lead.company)}</div>
          </div>
          <div class="field">
            <span class="field-label">💰 Budget</span>
            <div class="field-value">${lead.budget ? escapeHtml(lead.budget) : 'Not specified'}</div>
          </div>
          <div class="field">
            <span class="field-label">🔧 Skill</span>
            <div class="field-value">${lead.skill ? escapeHtml(lead.skill) : 'N/A'}</div>
          </div>
          <div class="field">
            <span class="field-label">📝 Description</span>
            <div class="field-value">${escapeHtml(lead.description).replace(/\n/g, '<br>')}</div>
          </div>
          <a href="https://yourapp.com/leads/${lead.id}" class="button">🚀 View Lead & Apply</a>
        </div>
        <div class="footer">
          You received this because you are a Pro member. <br>
          <a href="https://yourapp.com/settings/notifications">Unsubscribe</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Optima Alerts" <${user}>`,
    to: user, // or a dedicated pro email list – you can extend this later
    subject: `🔥 New Pro Lead: ${lead.title} at ${lead.company}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email notification sent:', info.messageId);
  } catch (error) {
    console.error('❌ Email sending error:', error);
  }
}

/**
 * Simple HTML escaping to prevent injection
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
