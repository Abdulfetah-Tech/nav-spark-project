-- Fix Critical Security Issues: Booking Manipulation, Storage Exposure, and Customer Privacy

-- ============================================================================
-- 1. FIX BOOKING PRICE MANIPULATION (CRITICAL)
-- ============================================================================
-- Drop overly permissive UPDATE policies on bookings table
DROP POLICY IF EXISTS "Customers can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Providers can update their bookings" ON public.bookings;

-- Customer: only update notes and status (cannot modify price, dates, or parties)
CREATE POLICY "Customers can update booking notes and cancel"
ON public.bookings FOR UPDATE
USING (auth.uid() = customer_id)
WITH CHECK (
  auth.uid() = customer_id AND
  -- Prevent modification of critical fields
  customer_id = (SELECT customer_id FROM bookings WHERE id = bookings.id) AND
  provider_id = (SELECT provider_id FROM bookings WHERE id = bookings.id) AND
  total_price = (SELECT total_price FROM bookings WHERE id = bookings.id) AND
  service_type = (SELECT service_type FROM bookings WHERE id = bookings.id) AND
  scheduled_date = (SELECT scheduled_date FROM bookings WHERE id = bookings.id)
);

-- Provider: only update status (e.g., pending → confirmed → completed)
CREATE POLICY "Providers can update booking status"
ON public.bookings FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM service_providers WHERE id = provider_id))
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM service_providers WHERE id = provider_id) AND
  -- Prevent modification of critical fields
  customer_id = (SELECT customer_id FROM bookings WHERE id = bookings.id) AND
  provider_id = (SELECT provider_id FROM bookings WHERE id = bookings.id) AND
  total_price = (SELECT total_price FROM bookings WHERE id = bookings.id) AND
  service_type = (SELECT service_type FROM bookings WHERE id = bookings.id) AND
  scheduled_date = (SELECT scheduled_date FROM bookings WHERE id = bookings.id) AND
  notes = (SELECT notes FROM bookings WHERE id = bookings.id)
);

-- ============================================================================
-- 2. FIX STORAGE BUCKET PUBLIC EXPOSURE
-- ============================================================================

-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view service images" ON storage.objects;
DROP POLICY IF EXISTS "Service images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Providers can upload service images" ON storage.objects;

-- AVATARS BUCKET: Authenticated access only, strict upload validation
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users upload to own avatar folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = (auth.uid())::text
);

-- SERVICE-IMAGES BUCKET: Provider role required, ownership validation
CREATE POLICY "Authenticated users can view service images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'service-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Providers upload to own service folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-images' AND
  has_role(auth.uid(), 'provider'::app_role) AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM service_providers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Providers update own service images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'service-images' AND
  has_role(auth.uid(), 'provider'::app_role) AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM service_providers WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'service-images' AND
  has_role(auth.uid(), 'provider'::app_role) AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM service_providers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Providers delete own service images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-images' AND
  has_role(auth.uid(), 'provider'::app_role) AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM service_providers WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- 3. FIX CUSTOMER ID EXPOSURE IN REVIEWS (PRIVACY)
-- ============================================================================

-- Note: RLS alone cannot hide specific columns. Applications MUST explicitly
-- select only safe columns when querying reviews for public display.
-- Create a view that excludes customer_id for public access

CREATE OR REPLACE VIEW public.public_reviews_safe AS
SELECT 
  id,
  provider_id,
  booking_id,
  rating,
  comment,
  created_at
FROM public.reviews;

-- Grant access to the safe view
GRANT SELECT ON public.public_reviews_safe TO anon, authenticated;

-- Add comment to reviews table for developers
COMMENT ON TABLE public.reviews IS 'SECURITY: When querying for public display, use public_reviews_safe view OR explicitly SELECT id, provider_id, booking_id, rating, comment, created_at (exclude customer_id to protect privacy)';

COMMENT ON VIEW public.public_reviews_safe IS 'Safe public view of reviews that excludes customer_id to protect user privacy. Use this view for displaying reviews to public/other users.';