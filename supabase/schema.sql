-- Schema for The Relationship Journey (Access Code & Password version)

-- 1. Couples table (Thay thế vai trò Tài khoản đăng nhập chung)
CREATE TABLE IF NOT EXISTS public.couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code text UNIQUE NOT NULL, -- Mã do hệ thống sinh ra (ví dụ: JRN-1234)
  password_hash text NOT NULL,      -- Mật khẩu chung đã được mã hoá
  start_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Partners table (Lưu thông tin chi tiết của 2 người trong Couple)
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE,
  name text NOT NULL,
  dob date,           -- Ngày sinh
  hobbies text,       -- Sở thích (có thể linh hoạt lưu trữ JSON hoặc text)
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Milestones table 
CREATE TABLE IF NOT EXISTS public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date timestamp with time zone NOT NULL,
  location text,
  image_url text,
  mood text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. QuestionBank table
CREATE TABLE IF NOT EXISTS public.question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text,
  stage text,
  question_text text NOT NULL
);

-- 5. QuizAnswers table (Tham chiếu tới partners thay vì users)
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.question_bank(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  is_revealed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(question_id, partner_id)
);

-- 6. BucketList table
CREATE TABLE IF NOT EXISTS public.bucket_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  badge_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TimeCapsuleLetters table (Tham chiếu tới partners thay vì users)
CREATE TABLE IF NOT EXISTS public.time_capsule_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  content text NOT NULL,
  open_date timestamp with time zone NOT NULL,
  is_opened boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tắt tính năng bảo vệ từng dòng (RLS) mặc định của Supabase
-- Vì toàn bộ logic bảo mật và kiểm tra mật khẩu đã được Next.js Server Actions xử lý
ALTER TABLE public.couples DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_list DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsule_letters DISABLE ROW LEVEL SECURITY;
