
-- Create enum for admin roles
CREATE TYPE admin_role AS ENUM ('owner', 'admin', 'moderator', 'tester');

-- Create enum for application status
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'denied');

-- Create admin applications table
CREATE TABLE admin_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord TEXT NOT NULL,
    requested_role admin_role NOT NULL,
    status application_status DEFAULT 'pending',
    secret_key TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create admin users table for IP-based access
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT UNIQUE NOT NULL,
    role admin_role NOT NULL,
    approved_by TEXT NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_access TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create auth config table for passwords
CREATE TABLE auth_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default passwords
INSERT INTO auth_config (config_key, config_value) VALUES 
('owner_password', '$$nullnox911$$'),
('general_password', '$$mcbevtl789db$$');

-- Enable RLS on all tables
ALTER TABLE admin_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all access for now since this is admin-only)
CREATE POLICY "Allow all access to admin_applications" ON admin_applications FOR ALL USING (true);
CREATE POLICY "Allow all access to admin_users" ON admin_users FOR ALL USING (true);
CREATE POLICY "Allow all access to auth_config" ON auth_config FOR ALL USING (true);

-- Create function to get client IP
CREATE OR REPLACE FUNCTION get_user_ip()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'x-real-ip',
    inet_client_addr()::text
  );
$$;

-- Create function to check admin access
CREATE OR REPLACE FUNCTION check_admin_access()
RETURNS TABLE(has_access boolean, user_role admin_role)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    user_ip TEXT;
    admin_record admin_users%ROWTYPE;
BEGIN
    user_ip := get_user_ip();
    
    SELECT * INTO admin_record 
    FROM admin_users 
    WHERE ip_address = user_ip;
    
    IF admin_record.ip_address IS NOT NULL THEN
        -- Update last access
        UPDATE admin_users 
        SET last_access = now() 
        WHERE ip_address = user_ip;
        
        RETURN QUERY SELECT true, admin_record.role;
    ELSE
        RETURN QUERY SELECT false, NULL::admin_role;
    END IF;
END;
$$;
