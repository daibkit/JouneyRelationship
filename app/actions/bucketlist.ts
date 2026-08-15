'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { BucketList } from '@/types/database';

const getCoupleId = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('couple_session')?.value;
};

// 1. Lấy danh sách Bucket List
export async function getBucketList(): Promise<{ data?: BucketList[], error?: string }> {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized. Please login again.' };

  const { data, error } = await supabase
    .from('bucket_list')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false }); // Mới nhất hiển thị trước

  if (error) {
    console.error('Error fetching bucket list:', error);
    return { error: 'Failed to fetch bucket list.' };
  }

  return { data: data as BucketList[] };
}

// 2. Thêm mới
export async function addBucketItem(formData: FormData) {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized' };

  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;

  if (!title) {
    return { error: 'Title is required.' };
  }

  const { data, error } = await supabase
    .from('bucket_list')
    .insert([{
      couple_id: coupleId,
      title: title,
      description: description,
      is_completed: false
    }])
    .select()
    .single();

  if (error) {
    return { error: `Failed to add bucket item: ${error.message}` };
  }

  return { success: true, data };
}

// 3. Cập nhật nội dung
export async function updateBucketItem(id: string, formData: FormData) {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized' };

  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;

  if (!title) {
    return { error: 'Title is required.' };
  }

  const { data, error } = await supabase
    .from('bucket_list')
    .update({
      title: title,
      description: description
    })
    .eq('id', id)
    .eq('couple_id', coupleId)
    .select()
    .single();

  if (error) {
    return { error: `Failed to update bucket item: ${error.message}` };
  }

  return { success: true, data };
}

// 4. Đánh dấu Hoàn thành / Chưa hoàn thành
export async function toggleBucketItemStatus(id: string, isCompleted: boolean) {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('bucket_list')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null
    })
    .eq('id', id)
    .eq('couple_id', coupleId)
    .select()
    .single();

  if (error) {
    return { error: `Failed to toggle status: ${error.message}` };
  }

  return { success: true, data };
}

// 5. Xoá
export async function deleteBucketItem(id: string) {
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('bucket_list')
    .delete()
    .eq('id', id)
    .eq('couple_id', coupleId); 

  if (error) {
    return { error: `Failed to delete bucket item: ${error.message}` };
  }

  return { success: true };
}
