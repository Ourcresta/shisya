import type { OtpPurpose } from "@shared/schema";

const PURPOSE_TEXT: Record<OtpPurpose, string> = {
  signup: "complete your registration",
  login: "log in to your account",
  forgot_password: "reset your password",
  verify_email: "verify your email address",
};

const SUBJECT_PREFIX: Record<OtpPurpose, string> = {
  signup: "Complete your OurShiksha registration",
  login: "Your OurShiksha login code",
  forgot_password: "Reset your OurShiksha password",
  verify_email: "Verify your OurShiksha email",
};

export function getOTPEmailTemplate(otp: string, purpose: OtpPurpose): { subject: string; html: string } {
  const purposeText = PURPOSE_TEXT[purpose];
  const subject = `${otp} - ${SUBJECT_PREFIX[purpose]}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1a1a1a; margin: 0; font-size: 24px; font-weight: 700;">OurShiksha</h1>
          <p style="color: #666; margin: 8px 0 0 0; font-size: 14px;">Student Learning Portal</p>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Your one-time password (OTP) to ${purposeText}:
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 20px 40px; border-radius: 12px; font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 24px;">
          This code expires in <strong>5 minutes</strong>.
        </p>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top: 24px;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>Security Notice:</strong> Never share this OTP with anyone. OurShiksha staff will never ask for your OTP.
          </p>
        </div>
        
        <div style="text-align: center; padding-top: 32px; border-top: 1px solid #eee; margin-top: 32px;">
          <p style="margin: 0; color: #999; font-size: 12px;">OurShiksha - Shishya Student Portal</p>
          <p style="margin: 4px 0 0 0; color: #bbb; font-size: 11px;">Powered by OurShiksha Technologies</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

export { PURPOSE_TEXT, SUBJECT_PREFIX };
