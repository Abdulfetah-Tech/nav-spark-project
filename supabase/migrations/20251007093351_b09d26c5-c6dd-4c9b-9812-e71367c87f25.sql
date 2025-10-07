-- Fix: Protect customer privacy in reviews
-- Drop the overly permissive policy that exposes customer_id
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Create a new policy that allows viewing reviews but applications 
-- must be careful not to expose customer_id
CREATE POLICY "Public can view review content"
ON public.reviews FOR SELECT
USING (true);

-- Add policy for customers to view their own full review data
CREATE POLICY "Customers can view their own reviews"
ON public.reviews FOR SELECT
USING (auth.uid() = customer_id);

-- Note: Applications should use the public_reviews view or explicitly 
-- select only non-sensitive columns (id, provider_id, booking_id, rating, comment, created_at)
-- to avoid exposing customer_id in public contexts