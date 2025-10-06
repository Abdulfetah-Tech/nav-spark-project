-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'provider', 'customer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create service_providers table
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  hourly_rate DECIMAL(10,2),
  availability JSONB DEFAULT '[]'::jsonb,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on service_providers
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- Service providers policies
CREATE POLICY "Anyone can view verified providers"
  ON public.service_providers FOR SELECT
  USING (verified = true OR auth.uid() = user_id);

CREATE POLICY "Providers can update their own listing"
  ON public.service_providers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can insert their own listing"
  ON public.service_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'provider'));

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id),
  service_type TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  total_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Customers can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Providers can view their bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.service_providers WHERE id = provider_id));

CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Providers can update their bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.service_providers WHERE id = provider_id));

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  provider_id UUID NOT NULL REFERENCES public.service_providers(id),
  customer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews for their bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-images', 'service-images', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for service images
CREATE POLICY "Service images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-images');

CREATE POLICY "Providers can upload service images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Providers can update their service images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Providers can delete their service images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update provider ratings
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.service_providers
  SET 
    rating = (SELECT AVG(rating) FROM public.reviews WHERE provider_id = NEW.provider_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE provider_id = NEW.provider_id)
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update provider ratings on new reviews
CREATE TRIGGER update_provider_rating_on_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_provider_rating();