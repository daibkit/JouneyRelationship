'use server';

import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

export async function sendNotificationEmail(partnerId: string, subject: string, htmlMessage: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY is not defined. Skipping email sending:', { subject, htmlMessage });
    return { success: false, error: 'No Resend API Key' };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // 1. Fetch the partner's email from database
    const { data: partner, error } = await supabase
      .from('partners')
      .select('email, name')
      .eq('id', partnerId)
      .single();

    if (error || !partner || !partner.email) {
      console.log('Partner missing or no email setup. Skipping email notification.');
      return { success: false, error: 'Partner has no email setup.' };
    }

    // 2. Send the email via Resend
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://uspath.app';
    const wrappedHtmlMessage = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="padding: 20px; text-align: left;">
          ${htmlMessage}
        </div>
        <div style="text-align: center; margin-top: 20px; padding-bottom: 20px;">
          <a href="${appUrl}" style="display: inline-block; padding: 12px 28px; background-color: #f43f5e; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(244, 63, 94, 0.2);">
            Mở Trang Web
          </a>
        </div>
      </div>
    `;

    const { data, error: sendError } = await resend.emails.send({
      from: 'Relationship Journey <notifications@uspath.app>',
      to: [partner.email],
      subject: subject,
      html: wrappedHtmlMessage,
    });

    if (sendError) {
      console.error('Error sending email:', sendError);
      return { success: false, error: sendError.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('sendNotificationEmail fatal error:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

export async function notifyPartner(coupleId: string, senderPartnerId: string, subject: string, htmlMessage: string) {
  try {
    const { data: partners } = await supabase
      .from('partners')
      .select('id, email')
      .eq('couple_id', coupleId);

    if (!partners || partners.length < 2) return { success: false, error: 'Not enough partners' };
    
    const receiver = partners.find(p => p.id !== senderPartnerId);
    if (!receiver || !receiver.email) return { success: false, error: 'No reachable partner' };

    return await sendNotificationEmail(receiver.id, subject, htmlMessage);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
