export type User = {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string | null;
  couple_id?: string | null;
  created_at: string;
};

export type Couple = {
  id: string;
  user1_id: string;
  user2_id?: string | null;
  pairing_code: string;
  start_date: string;
  created_at: string;
};

export type Milestone = {
  id: string;
  couple_id: string;
  title: string;
  description?: string | null;
  date: string;
  location?: string | null;
  image_url?: string | null;
  mood?: 'happy' | 'romantic' | 'excited' | 'emotional' | 'sad' | 'neutral' | string;
  created_at: string;
};

export type QuestionCategory = 'fun' | 'deep' | 'future' | 'spicy' | 'truth' | 'dare' | 'deep_talk';
export type QuestionStage = 'getting_to_know' | 'core_values' | 'healing';

export type Question = {
  id: string;
  category: QuestionCategory;
  stage: QuestionStage;
  question_text: string;
};

export type QuizAnswer = {
  id: string;
  couple_id: string;
  question_id: string;
  user_id: string;
  answer_text: string;
  is_revealed: boolean;
  created_at: string;
};

export type BucketList = {
  id: string;
  couple_id: string;
  title: string;
  description?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  badge_url?: string | null;
  created_at: string;
};

export type TimeCapsuleLetter = {
  id: string;
  couple_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  open_date: string;
  is_opened: boolean;
  created_at: string;
};

export type LoveCoupon = {
  id: string;
  couple_id: string;
  sender_id: string;
  receiver_id: string;
  title: string;
  description?: string | null;
  is_used: boolean;
  used_at?: string | null;
  created_at: string;
};

export type MusicPick = {
  id: string;
  couple_id: string;
  partner_id: string;
  spotify_url: string;
  message?: string | null;
  created_at: string;
};

export type DailyMood = {
  id: string;
  couple_id: string;
  partner_id: string;
  mood: string;
  note?: string | null;
  date: string;
  created_at: string;
};
