import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmails() {
  const { data, error } = await supabase.from('partners').select('id, name, email, couple_id');
  if (error) {
    console.error('Error fetching partners:', error);
  } else {
    console.log('Partners table:', data);
  }
}

checkEmails();
