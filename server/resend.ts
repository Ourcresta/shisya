import { Resend } from 'resend';
import { getOTPEmailTemplate } from './lib/otp-email';
import type { OtpPurpose } from '@shared/schema';

const DEFAULT_FROM_EMAIL = 'OurShiksha <noreply@mail.dishabrooms.com>';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }
  
  return {
    client: new Resend(apiKey),
    fromEmail: DEFAULT_FROM_EMAIL
  };
}

export async function sendOtpEmail(
  toEmail: string, 
  otp: string, 
  purpose: OtpPurpose = "signup",
  extraData?: { applicantName?: string; applicantEmail?: string }
): Promise<boolean> {
  try {
    const { client, fromEmail } = getResendClient();
    const { subject, html } = getOTPEmailTemplate(otp, purpose, extraData);
    
    const result = await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
    });
    
    if (result?.data?.id) {
      console.log(`OTP email sent successfully to ${toEmail} for purpose: ${purpose}`);
      return true;
    }
    
    console.error('OTP email send failed - no message ID returned', result?.error);
    return false;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}

export async function sendGenericEmail(
  toEmail: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = getResendClient();
    
    const result = await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
    });
    
    return !!result?.data?.id;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
