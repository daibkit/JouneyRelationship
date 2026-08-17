-- Migration script to add 'email' field for Notification features

ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS email text;
