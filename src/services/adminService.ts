import { supabase } from "@/integrations/supabase/client"

export interface AdminLoginResult {
  success: boolean
  sessionToken?: string
  adminId?: string
  role?: string
  needsOnboarding?: boolean
  error?: string
}

export interface AdminUser {
  id: string
  username: string
  role: string
  lastLogin?: string
}

export interface OnboardingData {
  discord: string
  requestedRole: string
  secretKey: string
}

// Clear all authentication state
export const clearAllAuthState = (): void => {
  localStorage.removeItem("admin_session_token")
  localStorage.removeItem("admin_role")
  localStorage.removeItem("admin_ip")
  localStorage.removeItem("admin_session_active")

  Object.keys(localStorage).forEach((key) => {
    if (key.includes("admin") || key.includes("auth")) {
      localStorage.removeItem(key)
    }
  })

  sessionStorage.clear()

  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
  })
}

export const checkAdminAccess = async (): Promise<{ hasAccess: boolean; role?: string }> => {
  const localRole = localStorage.getItem("admin_role")
  const localActive = localStorage.getItem("admin_session_active")
  if (localActive === "true" && localRole) {
    return { hasAccess: true, role: localRole }
  }

  try {
    const { data, error } = await supabase.rpc("check_admin_access")

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      const result = data[0]
      return { hasAccess: result.has_access, role: result.user_role }
    }

    return { hasAccess: false }
  } catch (error) {
    return { hasAccess: false }
  }
}

export const adminLogin = async (password: string): Promise<AdminLoginResult> => {
  try {
    const { data: configs, error } = await supabase.from("auth_config").select("config_key, config_value")

    if (error) {
      throw error
    }

    if (!configs || configs.length === 0) {
      return { success: false, error: "Authentication system not configured" }
    }

    // Check against all available password configs
    for (const config of configs) {
      if (config.config_value === password) {
        let role = "user"

        // Determine role based on config key
        if (config.config_key.includes("owner")) {
          role = "owner"
        } else if (config.config_key.includes("admin")) {
          role = "admin"
        } else if (config.config_key.includes("tester")) {
          role = "tester"
        } else if (config.config_key.includes("moderator") || config.config_key.includes("mod")) {
          role = "moderator"
        } else if (config.config_key.includes("general")) {
          role = "tester" // Default general access to tester role
        }

        const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        localStorage.setItem("admin_session_token", sessionToken)
        localStorage.setItem("admin_role", role)
        localStorage.setItem("admin_session_active", "true")

        return {
          success: true,
          sessionToken,
          role,
          adminId: `${role}-1`,
        }
      }
    }

    return { success: false, error: "Invalid password" }
  } catch (error: any) {
    return { success: false, error: "Authentication failed" }
  }
}

export const submitOnboardingApplication = async (
  data: OnboardingData,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from("admin_applications").insert({
      discord: data.discord,
      requested_role: data.requestedRole as "admin" | "moderator" | "tester",
      secret_key: data.secretKey,
      ip_address: "web_user",
      status: "pending",
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const verifyAdminSession = async (sessionToken: string): Promise<boolean> => {
  try {
    const result = await checkAdminAccess()
    const isValid = result.hasAccess && sessionToken.startsWith("admin_")

    return isValid
  } catch (error) {
    return false
  }
}

export const adminLogout = async (sessionToken: string): Promise<boolean> => {
  try {
    clearAllAuthState()
    return true
  } catch (error) {
    return false
  }
}

export const getAdminUser = async (sessionToken: string): Promise<AdminUser | null> => {
  try {
    if (sessionToken.startsWith("admin_")) {
      const result = await checkAdminAccess()
      if (result.hasAccess && result.role) {
        return {
          id: "admin-1",
          username: "admin",
          role: result.role,
          lastLogin: new Date().toISOString(),
        }
      }
    }
    return null
  } catch (error) {
    return null
  }
}

export const adminService = {
  adminLogin,
  verifyAdminSession,
  adminLogout,
  getAdminUser,
  checkAdminAccess,
  submitOnboardingApplication,
  clearAllAuthState,
}

export default adminService
