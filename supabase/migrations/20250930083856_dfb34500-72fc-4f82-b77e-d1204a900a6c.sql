-- Create contacts table for secure form submissions
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  CONSTRAINT name_length CHECK (char_length(name) <= 100),
  CONSTRAINT email_length CHECK (char_length(email) <= 255),
  CONSTRAINT message_length CHECK (char_length(message) <= 1000)
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact form submissions
CREATE POLICY "Anyone can submit contact form"
ON public.contacts
FOR INSERT
TO anon
WITH CHECK (true);

-- Only authenticated users can view contacts (prepared for future admin access)
CREATE POLICY "Only authenticated users can view contacts"
ON public.contacts
FOR SELECT
TO authenticated
USING (true);

-- Create index for rate limiting queries
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at);
CREATE INDEX idx_contacts_ip_address ON public.contacts(ip_address);