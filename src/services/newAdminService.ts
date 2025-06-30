
import { supabase } from '@/integrations/supabase/client';

export interface AdminApplication {
  id: string;
  discord: string;
  ip_address: string;
  secret_key: string;
  requested_role: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'denied';
  reviewed_at: string | null;
  reviewed_by: string | null;
}

interface AdminUser {
  id: string;
  approved_by: string;
  role: string;
  approved_at: string;
}

interface LoginResult {
  success: boolean;
  sessionToken?: string;
  error?: string;
  role?: string;
  needsOnboarding?: boolean;
  debug?: any[];
}

// Clear all authentication state
export const clearAllAuthState = (): void => {
  localStorage.removeItem('admin_session_token');
  localStorage.removeItem('admin_user_role');
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

export const newAdminService = {
  async adminLogin(secretKey: string, ipAddress: string): Promise<LoginResult> {
    try {
      const { data: application, error: applicationError } = await supabase
        .from('admin_applications')
        .select('*')
        .eq('secret_key', secretKey)
        .eq('ip_address', ipAddress)
        .eq('status', 'approved')
        .single();

      if (applicationError) {
        console.error('Application fetch error:', applicationError);
        return { success: false, error: 'Invalid secret key or IP address.' };
      }

      if (!application) {
        return { success: false, error: 'No approved application found.' };
      }

      const sessionToken = this.generateSessionToken();
      localStorage.setItem('admin_session_token', sessionToken);
      localStorage.setItem('admin_user_role', application.requested_role);

      return { success: true, sessionToken: sessionToken, role: application.requested_role };
    } catch (error: any) {
      console.error('Admin login error:', error);
      return { success: false, error: error.message };
    }
  },

  async validateSession(sessionToken: string): Promise<boolean> {
    const storedToken = localStorage.getItem('admin_session_token');
    return storedToken === sessionToken;
  },

  async getAdminRole(): Promise<string | null> {
    return localStorage.getItem('admin_user_role');
  },

  async clearAllAuthState(): Promise<void> {
    clearAllAuthState();
  },

  async checkAdminAccess(): Promise<{ hasAccess: boolean; role?: string; detail?: any[] }> {
    const token = localStorage.getItem('admin_session_token');
    const role = localStorage.getItem('admin_user_role') || localStorage.getItem('admin_role');
    
    if (!token || !role) {
      return { hasAccess: false, detail: ['No token or role found in localStorage'] };
    }

    const isValid = await this.validateSession(token);
    return { 
      hasAccess: isValid, 
      role: isValid ? role : undefined,
      detail: isValid ? ['Valid session found'] : ['Invalid session']
    };
  },

  async submitOnboardingApplication(data: { discord: string; secretKey: string; requestedRole: string }): Promise<{ success: boolean; error?: string }> {
    try {
      const ipAddress = 'unknown'; // Since we can't get real IP in browser
      
      const { error } = await supabase
        .from('admin_applications')
        .insert({
          discord: data.discord,
          ip_address: ipAddress,
          secret_key: data.secretKey,
          requested_role: data.requestedRole as 'admin' | 'moderator' | 'tester',
          status: 'pending'
        });

      if (error) {
        console.error('Submit application error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Submit application error:', error);
      return { success: false, error: error.message };
    }
  },

  async authenticateAdmin(secretKey: string, debug?: boolean): Promise<LoginResult> {
    try {
      // Check if it's the owner password
      if (secretKey === "$$nullnox911$$") {
        localStorage.setItem('admin_role', 'owner');
        localStorage.setItem('admin_session_token', this.generateSessionToken());
        return { 
          success: true, 
          role: 'owner',
          debug: debug ? ['Owner password matched'] : undefined
        };
      }

      // Check for general password that needs onboarding
      if (secretKey === "admin123") {
        return { 
          success: true, 
          needsOnboarding: true,
          debug: debug ? ['General password matched - needs onboarding'] : undefined
        };
      }

      const ipAddress = 'unknown';
      return this.adminLogin(secretKey, ipAddress);
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message,
        debug: debug ? ['Authentication error: ' + error.message] : undefined
      };
    }
  },

  async aggressiveManualRecheck(): Promise<{ hasAccess: boolean; role?: string; detail?: any[] }> {
    return this.checkAdminAccess();
  },

  generateSessionToken(): string {
    const randomBytes = new Uint8Array(32);
    window.crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
  },

  async getPendingApplications(): Promise<AdminApplication[]> {
    try {
      const { data, error } = await supabase
        .from('admin_applications')
        .select('*')
        .eq('status', 'pending');

      if (error) {
        console.error('Fetch applications error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get pending applications error:', error);
      return [];
    }
  },

  async clearAllAdminSessions(): Promise<{ success: boolean; error?: string }> {
    try {
      localStorage.removeItem('admin_session_token');
      localStorage.removeItem('admin_user_role');
      return { success: true };
    } catch (error: any) {
      console.error('Clear sessions error:', error);
      return { success: false, error: error.message };
    }
  },

  async reviewApplicationWithRole(
    applicationId: string, 
    action: 'approve' | 'deny', 
    reviewerRole: string,
    assignedRole?: string
  ) {
    try {
      console.log(`Reviewing application ${applicationId} with action: ${action}, role: ${assignedRole}`);
      
      if (action === 'approve' && assignedRole) {
        // Get application data first
        const { data: application, error: appError } = await supabase
          .from('admin_applications')
          .select('*')
          .eq('id', applicationId)
          .single();

        if (appError || !application) {
          console.error('Application fetch error:', appError);
          return { success: false, error: 'Application not found' };
        }

        // Insert into admin_users table
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            approved_by: reviewerRole,
            role: assignedRole as 'admin' | 'moderator' | 'tester',
            approved_at: new Date().toISOString(),
            ip_address: application.ip_address
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          return { success: false, error: insertError.message };
        }
      }

      // Update application status
      const { error: updateError } = await supabase
        .from('admin_applications')
        .update({ 
          status: action === 'approve' ? 'approved' : 'denied',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerRole
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Update error:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Review application error:', error);
      return { success: false, error: error.message };
    }
  },
};
