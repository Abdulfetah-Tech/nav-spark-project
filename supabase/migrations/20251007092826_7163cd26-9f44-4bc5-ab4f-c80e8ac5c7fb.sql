-- Fix 1: Secure Storage Buckets
-- Make buckets private
UPDATE storage.buckets
SET public = false
WHERE name IN ('avatars', 'service-images');

-- Add file size and type restrictions
UPDATE storage.buckets
SET 
  file_size_limit = 5242880,  -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
WHERE name IN ('avatars', 'service-images');

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Providers can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view service images" ON storage.objects;
DROP POLICY IF EXISTS "Providers can update their service images" ON storage.objects;
DROP POLICY IF EXISTS "Providers can delete their service images" ON storage.objects;

-- Storage RLS Policies for Avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage RLS Policies for Service Images
CREATE POLICY "Providers can upload service images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-images'
  AND has_role(auth.uid(), 'provider'::app_role)
);

CREATE POLICY "Anyone can view service images"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

CREATE POLICY "Providers can update their service images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'service-images'
  AND has_role(auth.uid(), 'provider'::app_role)
);

CREATE POLICY "Providers can delete their service images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-images'
  AND has_role(auth.uid(), 'provider'::app_role)
);

-- Fix 2: Anonymize Customer Data in Reviews
-- Drop view if exists
DROP VIEW IF EXISTS public.public_reviews;

-- Create a public view that excludes customer_id
CREATE VIEW public.public_reviews AS
SELECT 
  id, 
  provider_id, 
  booking_id, 
  rating, 
  comment, 
  created_at
FROM public.reviews;

-- Grant public access to the view
GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- Fix 3: Harden Profiles Table
-- Add foreign key constraint (drop first if exists)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add validation trigger to ensure user_id matches auth.uid()
CREATE OR REPLACE FUNCTION public.validate_profile_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot create profile for different user';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_user_id_trigger ON public.profiles;

CREATE TRIGGER validate_profile_user_id_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_user_id();