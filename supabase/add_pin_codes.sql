-- Migration to add PIN authentication to partners table

ALTER TABLE public.partners 
ADD COLUMN pin_code TEXT DEFAULT NULL;

-- Description: 
-- pin_code is intended to store a hashed 4-digit PIN using scrypt. 
-- Example format: "salt:hash", which is similar to the password_hash on the couples table.
