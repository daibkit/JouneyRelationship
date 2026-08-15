'use server';

import { supabase } from '@/lib/supabase';

export async function getQuestionsByCategory(category: string) {
  // Grab all questions for the category. Client handles shuffling.
  const { data, error } = await supabase
    .from('question_bank')
    .select('id, category, question_text')
    .eq('category', category);

  if (error) {
    console.error('Error fetching questions:', error);
    return { error: 'Failed to fetch questions' };
  }

  return { data };
}
