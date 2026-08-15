-- 1. Tab bảng Love Coupons (Voucher Hành Động)
CREATE TABLE IF NOT EXISTS public.love_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_used boolean DEFAULT false,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tab Music Picks (Nghe Chung Nhạc Spotify)
-- Lưu bản ghi âm nhạc hiện tại (Gần nhất) hoặc lịch sử quăng nhạc
CREATE TABLE IF NOT EXISTS public.music_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  spotify_url text NOT NULL,
  message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tab Daily Mood (Thả Cảm Xúc Hằng Ngày)
CREATE TABLE IF NOT EXISTS public.daily_moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  mood text NOT NULL,
  note text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(couple_id, partner_id, date) -- Mỗi người chỉ thả mood 1 lần 1 ngày (có thể upsert ghi đè)
);

-- Vô hiệu hóa RLS (Để Nextjs kiểm soát)
ALTER TABLE public.love_coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_picks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_moods DISABLE ROW LEVEL SECURITY;
