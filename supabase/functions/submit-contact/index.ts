import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { name, email, message }: ContactFormData = await req.json();

    // Validate input
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate lengths
    if (name.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Name must be less than 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (email.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Email must be less than 255 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (message.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Message must be less than 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client info for rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Check rate limiting: max 3 submissions per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentSubmissions, error: rateLimitError } = await supabase
      .from('contacts')
      .select('id')
      .eq('ip_address', clientIp)
      .gte('created_at', oneHourAgo);

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    if (recentSubmissions && recentSubmissions.length >= 3) {
      return new Response(
        JSON.stringify({ error: 'Too many submissions. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert contact form submission
    const { error: insertError } = await supabase
      .from('contacts')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        ip_address: clientIp,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit form. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Contact form submitted successfully from:', clientIp);

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully!' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-contact function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});