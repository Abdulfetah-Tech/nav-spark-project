-- Fix 1: Restrict contact form access to admins only
DROP POLICY IF EXISTS "Only authenticated users can view contacts" ON contacts;

CREATE POLICY "Only admins can view contacts"
ON contacts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Add explicit protection against privilege escalation
CREATE POLICY "Block direct role modification"
ON user_roles FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block role updates"
ON user_roles FOR UPDATE
USING (false);

CREATE POLICY "Block role deletion"
ON user_roles FOR DELETE
USING (false);

-- Create secure admin function for role management
CREATE OR REPLACE FUNCTION assign_user_role(
  target_user_id uuid,
  new_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can assign roles
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;
  
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Fix 3: Create trigger to handle user registration atomically
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Extract role from metadata (default to customer)
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'user_type')::app_role,
    'customer'::app_role
  );
  
  -- Create profile
  INSERT INTO profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign role
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for automatic profile/role creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();