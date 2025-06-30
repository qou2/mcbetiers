import { supabase } from "@/integrations/supabase/client"

export interface AdminApplication {
  id: string
  discord: string
  ip_address: string
  secret_key: string
  requested_role: string
  submitted_at: string
  status: "pending" | "approved" | "denied"
  reviewed_at: string | null
  reviewed_by: string | null
}

interface AdminUser {
  id: string
  approved_by: string
  role: string
  approved_at: string
}

interface LoginResult {
  success: boolean
  sessionToken?: string
  error?: string
  role?: string
  needsOnboarding?: boolean
  debug?: any[]
}

// Clear all authentication state
export const clearAllAuthState = (): void => {
  localStorage.removeItem("admin_session_token")
  localStorage.removeItem("admin_user_role")
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

export const newAdminService = {
  async getAuthConfig(): Promise<{ [key: string]: string }> {
    try {
      const { data, error } = await supabase.from("auth_config").select("config_key, config_value")

      if (error) {
        return {}
      }

      const config: { [key: string]: string } = {}
      data?.forEach((item) => {
        config[item.config_key] = item.config_value
      })

      return config
    } catch (error) {
      return {}
    }
  },

  async authenticateAdmin(secretKey: string, debug?: boolean): Promise<LoginResult> {
    try {
      const debugInfo: any[] = []

      // Get auth configuration from database
      const authConfig = await this.getAuthConfig()
      debugInfo.push("Authentication attempt processed")

      let role: string | null = null

      // Check against database stored passwords
      if (secretKey === authConfig.owner_password) {
        role = "owner"
        debugInfo.push("Owner access granted")
      } else if (secretKey === authConfig.admin_password) {
        role = "admin"
        debugInfo.push("Admin access granted")
      } else if (secretKey === authConfig.tester_password) {
        role = "tester"
        debugInfo.push("Tester access granted")
      } else if (secretKey === authConfig.moderator_password) {
        role = "moderator"
        debugInfo.push("Moderator access granted")
      } else if (secretKey === authConfig.general_password) {
        role = "tester"
        debugInfo.push("General access granted")
      } else {
        debugInfo.push("Access denied")
        return {
          success: false,
          error: "Invalid password",
          debug: debug ? debugInfo : undefined,
        }
      }

      // Set authentication state
      const sessionToken = this.generateSessionToken()
      localStorage.setItem("admin_session_token", sessionToken)
      localStorage.setItem("admin_role", role)
      localStorage.setItem("admin_session_active", "true")

      debugInfo.push(`Access granted for role: ${role}`)

      return {
        success: true,
        role: role,
        sessionToken: sessionToken,
        debug: debug ? debugInfo : undefined,
      }
    } catch (error: any) {
      return {
        success: false,
        error: "Authentication failed",
        debug: debug ? ["Authentication error occurred"] : undefined,
      }
    }
  },

  async validateSession(sessionToken: string): Promise<boolean> {
    const storedToken = localStorage.getItem("admin_session_token")
    return storedToken === sessionToken
  },

  async getAdminRole(): Promise<string | null> {
    return localStorage.getItem("admin_role")
  },

  async clearAllAuthState(): Promise<void> {
    clearAllAuthState()
  },

  async checkAdminAccess(): Promise<{ hasAccess: boolean; role?: string; detail?: any[] }> {
    const token = localStorage.getItem("admin_session_token")
    const role = localStorage.getItem("admin_role")
    const sessionActive = localStorage.getItem("admin_session_active")

    const detail: any[] = []

    if (!token) {
      detail.push("No session token found")
      return { hasAccess: false, detail }
    }

    if (!role) {
      detail.push("No role found")
      return { hasAccess: false, detail }
    }

    if (sessionActive !== "true") {
      detail.push("Session not active")
      return { hasAccess: false, detail }
    }

    if (token.length < 32) {
      detail.push("Invalid session token format")
      return { hasAccess: false, detail }
    }

    detail.push(`Valid session found for role: ${role}`)
    return {
      hasAccess: true,
      role: role,
      detail,
    }
  },

  async aggressiveManualRecheck(): Promise<{ hasAccess: boolean; role?: string; detail?: any[] }> {
    return this.checkAdminAccess()
  },

  generateSessionToken(): string {
    const randomBytes = new Uint8Array(32)
    window.crypto.getRandomValues(randomBytes)
    return Array.from(randomBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
  },

  async updateAuthConfig(configKey: string, configValue: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("auth_config").upsert({
        config_key: configKey,
        config_value: configValue,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getPendingApplications(): Promise<AdminApplication[]> {
    try {
      const { data, error } = await supabase.from("admin_applications").select("*").eq("status", "pending")

      if (error) {
        return []
      }

      return data || []
    } catch (error) {
      return []
    }
  },

  async clearAllAdminSessions(): Promise<{ success: boolean; error?: string }> {
    try {
      localStorage.removeItem("admin_session_token")
      localStorage.removeItem("admin_user_role")
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async reviewApplicationWithRole(
    applicationId: string,
    action: "approve" | "deny",
    reviewerRole: string,
    assignedRole?: string,
  ) {
    try {
      if (action === "approve" && assignedRole) {
        const { data: application, error: appError } = await supabase
          .from("admin_applications")
          .select("*")
          .eq("id", applicationId)
          .single()

        if (appError || !application) {
          return { success: false, error: "Application not found" }
        }

        const { error: insertError } = await supabase.from("admin_users").insert({
          approved_by: reviewerRole,
          role: assignedRole as "admin" | "moderator" | "tester",
          approved_at: new Date().toISOString(),
          ip_address: application.ip_address,
        })

        if (insertError) {
          return { success: false, error: insertError.message }
        }
      }

      const { error: updateError } = await supabase
        .from("admin_applications")
        .update({
          status: action === "approve" ? "approved" : "denied",
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerRole,
        })
        .eq("id", applicationId)

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },
}
