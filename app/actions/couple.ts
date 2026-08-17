'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

const getCoupleId = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('couple_session')?.value;
};

export async function getCoupleProfile() {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized' };

  // Fetch Couple
  const { data: couple, error: cErr } = await supabase
    .from('couples')
    .select('id, access_code, start_date, created_at')
    .eq('id', coupleId)
    .single();

  if (cErr || !couple) return { error: 'Couple not found' };

  // Fetch Partners
  const { data: partners, error: pErr } = await supabase
    .from('partners')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: true });

  if (pErr) return { error: 'Partners not found' };

  const cookieStore = await cookies();
  const currentPartnerId = cookieStore.get('partner_session')?.value || null;

  return { success: true, data: { couple, partners, currentPartnerId } };
}

export async function updateCoupleProfile(updates: any) {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('couples')
    .update(updates)
    .eq('id', coupleId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function updatePartnerProfile(partnerId: string, updates: any) {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('partners')
    .update(updates)
    .eq('id', partnerId)
    .eq('couple_id', coupleId) // Protection
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function uploadAvatar(formData: FormData) {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized' };

  const partnerId = formData.get('partnerId') as string;
  const imageFile = formData.get('image') as File | null;

  if (!partnerId || !imageFile) return { error: 'Missing required parameters' };

  const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${partnerId}_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, imageFile, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  // Auto update user avatar
  const { data, error: updateError } = await supabase
    .from('partners')
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq('id', partnerId)
    .eq('couple_id', coupleId)
    .select()
    .single();

  if (updateError) return { error: updateError.message };
  
  return { success: true, data };
}
