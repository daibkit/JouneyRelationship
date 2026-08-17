'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Milestone } from '@/types/database';
import { notifyPartner } from './email';

// Lấy couple_id từ Session
const getCoupleId = async () => {
  const cookieStore = await cookies();
  const coupleId = cookieStore.get('couple_session')?.value;
  return coupleId;
};

// 1. Fetch Milestones
export async function getMilestones(): Promise<{ data?: Milestone[], error?: string }> {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized. Please login again.' };

  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('couple_id', coupleId)
    .order('date', { ascending: false }); // Mới nhất lên đầu

  if (error) {
    console.error('Error fetching milestones:', error);
    return { error: 'Failed to fetch milestones.' };
  }

  return { data };
}

// 2. Add Milestone
export async function addMilestone(formData: FormData) {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized' };

  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const dateStr = formData.get('date') as string;
  const location = (formData.get('location') as string) || null;
  const mood = (formData.get('mood') as string) || 'romantic';
  const imageFile = formData.get('image') as File | null;

  if (!title || !dateStr) {
    return { error: 'Title and Date are required.' };
  }

  // Handle Image Upload if exists
  let image_url = null;
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${coupleId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('milestone_images')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Failed to upload image:', uploadError);
      return { error: `RLS or Storage error: ${uploadError.message}` };
    } else {
      const { data: publicUrlData } = supabase.storage
        .from('milestone_images')
        .getPublicUrl(filePath);
      
      image_url = publicUrlData.publicUrl;
    }
  }

  // Format date to ISO
  const dateObj = new Date(dateStr);

  const { data, error } = await supabase
    .from('milestones')
    .insert([{
      couple_id: coupleId,
      title: title,
      description: description,
      date: dateObj.toISOString(),
      location: location,
      mood: mood,
      image_url: image_url
    }])
    .select()
    .single();

  if (error) {
    return { error: `Failed to add milestone: ${error.message}` };
  }

  // Get current partner ID and notify the other one
  const cookieStore = await cookies();
  const currentPartnerId = cookieStore.get('partner_session')?.value;
  if (currentPartnerId) {
    notifyPartner(coupleId, currentPartnerId, 'Hành trình mới vừa được thêm! ✨', `<p>Người ấy vừa ghi lại một kỷ niệm mới trên hành trình: <strong>${title}</strong></p><p>Vào trang chủ để xem họ đã lưu lại điều gì nhé!</p>`).catch(console.error);
  }

  return { success: true, data };
}

// 3. Update Milestone
export async function updateMilestone(id: string, formData: FormData) {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized' };

  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const dateStr = formData.get('date') as string;
  const location = (formData.get('location') as string) || null;
  const mood = (formData.get('mood') as string) || 'romantic';
  const imageFile = formData.get('image') as File | null;

  if (!title || !dateStr) {
    return { error: 'Title and Date are required.' };
  }

  // Define what columns to update
  const updates: any = {
    title: title,
    description: description,
    date: new Date(dateStr).toISOString(),
    location: location,
    mood: mood
  };

  // Handle Image Upload if new image exists
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${coupleId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('milestone_images')
      .upload(filePath, imageFile);

    if (uploadError) {
      return { error: `Failed to upload image: ${uploadError.message}` };
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('milestone_images')
      .getPublicUrl(filePath);
    
    updates.image_url = publicUrlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('milestones')
    .update(updates)
    .eq('id', id)
    .eq('couple_id', coupleId) // Ensure they own it
    .select()
    .single();

  if (error) {
    return { error: `Failed to update milestone: ${error.message}` };
  }

  return { success: true, data };
}

// 4. Delete Milestone
export async function deleteMilestone(id: string) {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id)
    .eq('couple_id', coupleId); 

  if (error) {
    return { error: `Failed to delete milestone: ${error.message}` };
  }

  return { success: true };
}
