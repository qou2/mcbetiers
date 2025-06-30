import { supabase } from '@/integrations/supabase/client';

export interface AdminLoginResult {
  success: boolean;
  sessionToken?: string;
  adminId?: string;
  role?: string;
  needsOnboarding?: boolean;
  error?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: string;
  lastLogin?: string;
}

export interface OnboardingData {
  discord: string;
  requestedRole: string;
  secretKey: string;
}

// Clear all authentication state
export const clearAllAuthState = (): void => {
  localStorage.removeItem('admin_session_token');
  localStorage.removeItem('admin_role');
  localStorage.removeItem('admin_ip');
  localStorage.removeItem('admin_session_active');
  
  Object.keys(localStorage).forEach(key => {
    if (key.includes('admin') || key.includes('auth')) {
      localStorage.removeItem(key);
    }
  });

  sessionStorage.clear();
  
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
};

// Updated checkAdminAccess: just return false if not owner in localStorage session, skip IP logic
export const checkAdminAccess = async (): Promise<{ hasAccess: boolean; role?: string }> => {
  const localRole = localStorage.getItem('admin_role');
  const localActive = localStorage.getItem('admin_session_active');
  if (localActive === 'true' && localRole) {
    return { hasAccess: true, role: localRole };
  }
  // fallback to DB (for migration compatibility)
  try {
    console.log('Checking admin access via database...');
    const { data, error } = await supabase.rpc('check_admin_access');
    
    if (error) {
      console.error('Admin access check error:', error);
      throw error;
    }
    
    console.log('Database access check result:', data);
    
    if (data && data.length > 0) {
      const result = data[0];
      console.log('Admin access result:', result);
      return { hasAccess: result.has_access, role: result.user_role };
    }
    
    return { hasAccess: false };
  } catch (error) {
    console.error('Admin access check error:', error);
    return { hasAccess: false };
  }
};

// Initialize auth config if it doesn't exist
const initializeAuthConfig = async () => {
  try {
    console.log('Initializing auth config...');
    
    // Check if owner password exists
    const { data: existing, error: checkError } = await supabase
      .from('auth_config')
      .select('config_key')
      .eq('config_key', 'owner_password')
      .maybeSingle();

    if (checkError) {
      console.error('Error checking auth config:', checkError);
      return;
    }

    if (!existing) {
      // Insert owner password
      const { error: insertError } = await supabase
        .from('auth_config')
        .insert({ config_key: 'owner_password', config_value: '$$nullnox911$$' });
      
      if (insertError) {
        console.error('Error inserting owner password:', insertError);
      } else {
        console.log('Owner password initialized');
      }
    } else {
      console.log('Owner password already exists');
    }

    // Check if general password exists
    const { data: generalExists, error: generalCheckError } = await supabase
      .from('auth_config')
      .select('config_key')
      .eq('config_key', 'general_password')
      .maybeSingle();

    if (generalCheckError) {
      console.error('Error checking general password:', generalCheckError);
      return;
    }

    if (!generalExists) {
      // Insert general password
      const { error: insertError } = await supabase
        .from('auth_config')
        .insert({ config_key: 'general_password', config_value: 'admin123' });
      
      if (insertError) {
        console.error('Error inserting general password:', insertError);
      } else {
        console.log('General password initialized');
      }
    } else {
      console.log('General password already exists');
    }
  } catch (error) {
    console.error('Failed to initialize auth config:', error);
  }
};

// Update adminLogin: store admin_session_active on success, skip getUserIP
export const adminLogin = async (password: string): Promise<AdminLoginResult> => {
  try {
    console.log('Starting admin login process...');
    
    // Initialize auth config first
    await initializeAuthConfig();

    const { data: configs, error } = await supabase
      .from('auth_config')
      .select('config_key, config_value');

    if (error) {
      console.error('Error fetching auth config:', error);
      throw error;
    }

    console.log('Auth configs fetched:', configs?.length || 0, 'entries');

    const ownerPassword = configs?.find(c => c.config_key === 'owner_password')?.config_value;
    const generalPassword = configs?.find(c => c.config_key === 'general_password')?.config_value;

    console.log('Owner password from DB:', ownerPassword);
    console.log('Input password:', password);
    console.log('Passwords match:', password === ownerPassword);

    if (password === ownerPassword) {
      console.log('Owner login successful');
      // Remove IP logic: just set role in localStorage
      const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('admin_session_token', sessionToken);
      localStorage.setItem('admin_role', 'owner');
      localStorage.setItem('admin_session_active', 'true');
      return { 
        success: true, 
        sessionToken, 
        role: 'owner', 
        adminId: 'owner-1' 
      };
    } else if (password === generalPassword) {
      console.log('General password matched - needs onboarding');
      return { success: true, needsOnboarding: true };
    } else {
      console.log('Invalid password provided');
      return { success: false, error: 'Invalid password' };
    }
  } catch (error: any) {
    console.error('Admin authentication error:', error);
    return { success: false, error: error.message || 'Authentication failed' };
  }
};

export const submitOnboardingApplication = async (data: OnboardingData): Promise<{ success: boolean; error?: string }> => {
  try {
    const userIp = await getUserIP();
    
    const { error } = await supabase
      .from('admin_applications')
      .insert({
        discord: data.discord,
        requested_role: data.requestedRole as 'admin' | 'moderator' | 'tester',
        secret_key: data.secretKey,
        ip_address: userIp,
        status: 'pending'
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Onboarding submission error:', error);
    return { success: false, error: error.message };
  }
};

export const verifyAdminSession = async (sessionToken: string): Promise<boolean> => {
  try {
    console.log('Verifying admin session:', sessionToken);
    
    // Check if user has access via IP
    const result = await checkAdminAccess();
    const isValid = result.hasAccess && sessionToken.startsWith('admin_');
    
    console.log('Session verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Session verification error:', error);
    return false;
  }
};

export const adminLogout = async (sessionToken: string): Promise<boolean> => {
  try {
    console.log('Logging out admin session');
    clearAllAuthState();
    return true;
  } catch (error) {
    console.error('Admin logout error:', error);
    return false;
  }
};

export const getAdminUser = async (sessionToken: string): Promise<AdminUser | null> => {
  try {
    if (sessionToken.startsWith('admin_')) {
      const result = await checkAdminAccess();
      if (result.hasAccess && result.role) {
        return {
          id: 'admin-1',
          username: 'admin',
          role: result.role,
          lastLogin: new Date().toISOString()
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Get admin user error:', error);
    return null;
  }
};

// Generate a consistent user IP for this session
const getUserIP = async (): Promise<string> => {
  // Try to get existing IP from localStorage first
  let userIp = localStorage.getItem('admin_ip');
  
  if (!userIp) {
    // Generate a new unique identifier
    userIp = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('admin_ip', userIp);
  }
  
  return userIp;
};

export const adminService = {
  adminLogin,
  verifyAdminSession,
  adminLogout,
  getAdminUser,
  checkAdminAccess,
  submitOnboardingApplication,
  clearAllAuthState
};

export default adminService;
