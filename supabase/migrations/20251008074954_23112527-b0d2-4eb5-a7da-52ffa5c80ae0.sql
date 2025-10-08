-- Create quotations table for service quote requests
CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid NOT NULL,
  quoted_price numeric NOT NULL,
  description text,
  estimated_duration text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  valid_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Customers can view quotes for their bookings
CREATE POLICY "Customers can view their quotes"
ON public.quotations
FOR SELECT
USING (auth.uid() = customer_id);

-- Providers can view their quotes
CREATE POLICY "Providers can view their quotes"
ON public.quotations
FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM public.service_providers WHERE id = quotations.provider_id
));

-- Providers can create quotes
CREATE POLICY "Providers can create quotes"
ON public.quotations
FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT user_id FROM public.service_providers WHERE id = quotations.provider_id
));

-- Providers can update their own quotes
CREATE POLICY "Providers can update their quotes"
ON public.quotations
FOR UPDATE
USING (auth.uid() IN (
  SELECT user_id FROM public.service_providers WHERE id = quotations.provider_id
));

-- Customers can update quote status (accept/reject)
CREATE POLICY "Customers can update quote status"
ON public.quotations
FOR UPDATE
USING (auth.uid() = customer_id)
WITH CHECK (
  auth.uid() = customer_id AND
  -- Only allow status changes
  quoted_price = (SELECT quoted_price FROM quotations WHERE id = quotations.id) AND
  description = (SELECT description FROM quotations WHERE id = quotations.id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add service_area and years_experience to service_providers
ALTER TABLE public.service_providers 
ADD COLUMN IF NOT EXISTS service_area text,
ADD COLUMN IF NOT EXISTS years_experience integer;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON public.quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_provider ON public.quotations(provider_id);
CREATE INDEX IF NOT EXISTS idx_quotations_booking ON public.quotations(booking_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_service_type ON public.service_providers(service_type);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);