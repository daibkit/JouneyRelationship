'use server';

import { supabase } from '@/lib/supabase';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const encryptPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hashedBuffer = scryptSync(password, salt, 64);
  return `${salt}:${hashedBuffer.toString('hex')}`;
};

const verifyPassword = (password: string, storedHash: string): boolean => {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const hashedBuffer = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  const match = timingSafeEqual(hashedBuffer, keyBuffer);
  return match;
};

const generateAccessCode = () => {
  // Generates a recognizable code like JRN-XXXX (e.g. JRN-8A4F)
  const code = randomBytes(2).toString('hex').toUpperCase();
  return `JRN-${code}`;
};

export async function registerCouple(formData: FormData) {
  // Extract partners data
  const p1Name = formData.get('p1Name') as string;
  const p1Dob = formData.get('p1Dob') as string;
  const p1Hobbies = formData.get('p1Hobbies') as string;
  
  const p2Name = formData.get('p2Name') as string;
  const p2Dob = formData.get('p2Dob') as string;
  const p2Hobbies = formData.get('p2Hobbies') as string;

  const password = formData.get('password') as string;

  if (!p1Name || !p2Name || !password) {
    return { error: 'Please provide names for both partners and a valid password.' };
  }

  const accessCode = generateAccessCode();
  const passwordHash = encryptPassword(password);

  // 1. Insert Couple
  const { data: couple, error: coupleError } = await supabase
    .from('couples')
    .insert([{ access_code: accessCode, password_hash: passwordHash }])
    .select()
    .single();

  if (coupleError || !couple) {
    console.error('Error creating couple:', coupleError);
    return { error: `Lỗi Database (Couples): ${coupleError?.message || 'Không rõ'}` };
  }

  const coupleId = couple.id;

  // 2. Insert Partners
  const { error: partnersError } = await supabase
    .from('partners')
    .insert([
      { couple_id: coupleId, name: p1Name, dob: p1Dob || null, hobbies: p1Hobbies || null },
      { couple_id: coupleId, name: p2Name, dob: p2Dob || null, hobbies: p2Hobbies || null }
    ]);

  if (partnersError) {
    console.error('Error creating partners:', partnersError);
    // Cleanup couple if partner fails could be implemented here
    return { error: `Lỗi Database (Partners): ${partnersError?.message || 'Không rõ'}` };
  }

  // 3. Set Session Cookie (using couple id)
  // For Next.js 15+, cookies() should be awaited.
  const cookieStore = await cookies();
  cookieStore.set('couple_session', coupleId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  return { success: true, accessCode };
}

export async function loginCouple(formData: FormData) {
  const code = formData.get('code') as string;
  const password = formData.get('password') as string;

  if (!code || !password) {
    return { error: 'Missing access code or password.' };
  }

  const { data: couple, error } = await supabase
    .from('couples')
    .select('id, password_hash')
    .eq('access_code', code)
    .single();

  if (error || !couple) {
    return { error: 'Invalid access code or password.' };
  }

  const isValid = verifyPassword(password, couple.password_hash);
  if (!isValid) {
    return { error: 'Invalid access code or password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('couple_session', couple.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  return { success: true };
}

export async function logoutCouple() {
  const cookieStore = await cookies();
  cookieStore.delete('couple_session');
  cookieStore.delete('partner_session');
  redirect('/login');
}

export async function createPartnerPin(partnerId: string, pinCode: string) {
  if (!pinCode || pinCode.length < 4) return { error: 'Invalid PIN' };

  const cookieStore = await cookies();
  const coupleId = cookieStore.get('couple_session')?.value;
  if (!coupleId) return { error: 'Unauthorized' };

  const pinHash = encryptPassword(pinCode);

  const { error } = await supabase
    .from('partners')
    .update({ pin_code: pinHash })
    .eq('id', partnerId)
    .eq('couple_id', coupleId);

  if (error) return { error: 'Database update failed' };

  cookieStore.set('partner_session', partnerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });

  return { success: true };
}

export async function loginPartner(partnerId: string, pinCode: string) {
  if (!pinCode) return { error: 'Missing PIN' };

  const cookieStore = await cookies();
  const coupleId = cookieStore.get('couple_session')?.value;
  if (!coupleId) return { error: 'Unauthorized' };

  const { data: partner, error } = await supabase
    .from('partners')
    .select('pin_code')
    .eq('id', partnerId)
    .eq('couple_id', coupleId)
    .single();

  if (error || !partner || !partner.pin_code) {
    return { error: 'Invalid operation' };
  }

  const isValid = verifyPassword(pinCode, partner.pin_code);
  if (!isValid) return { error: 'Mã PIN không đúng!' };

  cookieStore.set('partner_session', partnerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });

  return { success: true };
}
