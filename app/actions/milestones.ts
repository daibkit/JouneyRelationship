'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Milestone } from '@/types/database';

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

  if (!title || !dateStr) {
    return { error: 'Title and Date are required.' };
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
      mood: mood
    }])
    .select()
    .single();

  if (error) {
    return { error: `Failed to add milestone: ${error.message}` };
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

  if (!title || !dateStr) {
    return { error: 'Title and Date are required.' };
  }

  const dateObj = new Date(dateStr);

  const { data, error } = await supabase
    .from('milestones')
    .update({
      title: title,
      description: description,
      date: dateObj.toISOString(),
      location: location,
      mood: mood
    })
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
