'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { MusicPick, DailyMood, LoveCoupon, TimeCapsuleLetter } from '@/types/database';

const getSessionInfo = async () => {
  const cookieStore = await cookies();
  const coupleId = cookieStore.get('couple_session')?.value;
  // Note: we usually need partner_id too. If the current store manages it, we might need to pass partner_id from client.
  return coupleId;
};

// ======================= MUSIC PICKS ======================= //

export async function getMusicPicks(): Promise<{ data?: MusicPick[], error?: string }> {
  const coupleId = await getSessionInfo();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('music_picks')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as MusicPick[] };
}

export async function addMusicPick(partnerId: string, spotifyUrl: string, message?: string) {
  const coupleId = await getSessionInfo();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('music_picks')
    .insert([{
      couple_id: coupleId,
      partner_id: partnerId,
      spotify_url: spotifyUrl,
      message: message || null
    }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function deleteMusicPick(id: string) {
  const coupleId = await getSessionInfo();
  if (!coupleId) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('music_picks')
    .delete()
    .eq('id', id)
    .eq('couple_id', coupleId); 

  if (error) return { error: error.message };
  return { success: true };
}

// ======================= DAILY MOODS ======================= //

export async function getDailyMoods(date: string): Promise<{ data?: DailyMood[], error?: string }> {
  const coupleId = await getSessionInfo();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('daily_moods')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('date', date);

  if (error) return { error: error.message };
  return { data: data as DailyMood[] };
}

export async function upsertDailyMood(partnerId: string, date: string, mood: string, note?: string) {
  const coupleId = await getSessionInfo();
  if (!coupleId) return { error: 'Unauthorized' };

  // Postgres upsert relying on UNIQUE(couple_id, partner_id, date)
  const { data, error } = await supabase
    .from('daily_moods')
    .upsert(
      { couple_id: coupleId, partner_id: partnerId, date, mood, note: note || null },
      { onConflict: 'couple_id,partner_id,date' }
    )
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, data };
}

// ======================= LOVE COUPONS ======================= //

export async function getLoveCoupons(): Promise<{ data?: LoveCoupon[], error?: string }> {
  const coupleId = await getSessionInfo();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('love_coupons')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as LoveCoupon[] };
}

export async function addLoveCoupon(senderId: string, receiverId: string, title: string, description?: string) {
  const coupleId = await getSessionInfo();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('love_coupons')
    .insert([{
      couple_id: coupleId,
      sender_id: senderId,
      receiver_id: receiverId,
      title,
      description: description || null
    }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function redeemLoveCoupon(id: string) {
  const coupleId = await getSessionInfo();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('love_coupons')
    .update({
      is_used: true,
      used_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('couple_id', coupleId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, data };
}

// ======================= TIME CAPSULE ======================= //

export async function getTimeCapsules(): Promise<{ data?: TimeCapsuleLetter[], error?: string }> {
  const coupleId = await getSessionInfo();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('time_capsule_letters')
    .select('*')
    .eq('couple_id', coupleId)
    .order('open_date', { ascending: true });

  if (error) return { error: error.message };
  return { data: data as TimeCapsuleLetter[] };
}

export async function addTimeCapsule(senderId: string, receiverId: string, content: string, openDate: string) {
  const coupleId = await getSessionInfo();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('time_capsule_letters')
    .insert([{
      couple_id: coupleId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      open_date: openDate
    }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function openTimeCapsule(id: string) {
  const coupleId = await getSessionInfo();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('time_capsule_letters')
    .update({ is_opened: true })
    .eq('id', id)
    .eq('couple_id', coupleId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, data };
}
