import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

export async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const result = await client.emails.send({
      from: fromEmail || 'OurShiksha <noreply@ourshiksha.app>',
      to: toEmail,
      subject: 'Verify your OurShiksha account',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 700; margin: 0;">OurShiksha</h1>
            <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Student Learning Portal</p>
          </div>
          <div style="border-top: 1px solid #e5e5e5; padding-top: 24px;">
            <h2 style="color: #333; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">Verify your email</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.5; margin: 0 0 20px 0;">Use the verification code below to complete your account setup:</p>
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 24px; text-align: center; border-radius: 12px; margin: 20px 0; border: 1px solid #dee2e6;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;">${otp}</span>
            </div>
            <p style="color: #dc3545; font-size: 14px; font-weight: 500; margin: 0 0 8px 0;">This code expires in 5 minutes.</p>
            <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 0;">If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.</p>
          </div>
          <div style="border-top: 1px solid #e5e5e5; margin-top: 32px; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">This email was sent by OurShiksha.</p>
          </div>
        </div>
      `,
    });
    
    return !!result?.data?.id;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}
