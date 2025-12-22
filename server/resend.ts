import { Resend } from 'resend';
import { getOTPEmailTemplate } from './lib/otp-email';
import type { OtpPurpose } from '@shared/schema';

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

export async function sendOtpEmail(
  toEmail: string, 
  otp: string, 
  purpose: OtpPurpose = "signup"
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const { subject, html } = getOTPEmailTemplate(otp, purpose);
    
    const result = await client.emails.send({
      from: fromEmail || 'OurShiksha <noreply@ourshiksha.app>',
      to: toEmail,
      subject,
      html,
    });
    
    if (result?.data?.id) {
      console.log(`OTP email sent successfully to ${toEmail} for purpose: ${purpose}`);
      return true;
    }
    
    console.error('OTP email send failed - no message ID returned');
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
    const { client, fromEmail } = await getUncachableResendClient();
    
    const result = await client.emails.send({
      from: fromEmail || 'OurShiksha <noreply@ourshiksha.app>',
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
