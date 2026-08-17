-- Create a new bucket for milestone images
INSERT INTO storage.buckets (id, name, public) VALUES ('milestone_images', 'milestone_images', true) ON CONFLICT (id) DO NOTHING;

-- Policy to allow public viewing
DROP POLICY IF EXISTS "Allow public viewing of milestone images" ON storage.objects;
CREATE POLICY "Allow public viewing of milestone images" ON storage.objects
FOR SELECT
USING (bucket_id = 'milestone_images');

-- Policy to allow authenticated users to upload files
DROP POLICY IF EXISTS "Allow authenticated users to upload milestone images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload milestone images" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'milestone_images'
);

-- Policy to allow authenticated users to delete files (optional)
DROP POLICY IF EXISTS "Allow authenticated users to delete milestone images" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete milestone images" ON storage.objects
FOR DELETE
USING (
    bucket_id = 'milestone_images'
);
-- Create a new bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Policy to allow public viewing
DROP POLICY IF EXISTS "Allow public viewing of avatars" ON storage.objects;
CREATE POLICY "Allow public viewing of avatars" ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Policy to allow authenticated users to upload avatars
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
);

-- Policy to allow authenticated users to update/delete avatars
DROP POLICY IF EXISTS "Allow authenticated users to update avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to update avatars" ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'avatars'
);

DROP POLICY IF EXISTS "Allow authenticated users to delete avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete avatars" ON storage.objects
FOR DELETE
USING (
    bucket_id = 'avatars'
);
