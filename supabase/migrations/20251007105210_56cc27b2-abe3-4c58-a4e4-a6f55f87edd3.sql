-- Fix: Remove SECURITY DEFINER view and rely on RLS policies instead
-- The public_reviews view is no longer needed since we have proper RLS policies
-- on the reviews table that allow public viewing while protecting customer_id

DROP VIEW IF EXISTS public.public_reviews;

-- Note: Applications should query the reviews table directly and select only
-- the columns they need (id, provider_id, booking_id, rating, comment, created_at)
-- The RLS policies will ensure proper access control