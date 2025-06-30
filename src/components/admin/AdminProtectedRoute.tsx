"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AdminAuth } from "./AdminAuth"
import { adminService } from "@/services/adminService"

interface AdminProtectedRouteProps {
  children: (userRole: string) => React.ReactNode
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check local session first
        const sessionActive = localStorage.getItem("admin_session_active")
        const storedRole = localStorage.getItem("admin_role")
        if (sessionActive === "true" && storedRole) {
          setUserRole(storedRole)
          setIsLoading(false)
          return
        }

        // Fallback to database check
        const sessionToken = localStorage.getItem("admin_session_token")
        const storedRoleFallback = localStorage.getItem("admin_role")

        if (sessionToken && storedRoleFallback) {
          const isValid = await adminService.verifyAdminSession(sessionToken)
          if (isValid) {
            setUserRole(storedRoleFallback)
            setIsLoading(false)
            return
          } else {
            adminService.clearAllAuthState()
          }
        }

        // Check database access
        const result = await adminService.checkAdminAccess()
        if (result.hasAccess && result.role) {
          setUserRole(result.role)

          // Create session for this access
          const newSessionToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem("admin_session_token", newSessionToken)
          localStorage.setItem("admin_role", result.role)
        } else {
          setUserRole(null)
        }
      } catch (error) {
        setUserRole(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkAccess()
  }, [])

  const handleAuthSuccess = async () => {
    // Read role from localStorage immediately
    const storedRole = localStorage.getItem("admin_role")
    if (storedRole) {
      setUserRole(storedRole)
    } else {
      // Fallback
      setTimeout(async () => {
        try {
          const result = await adminService.checkAdminAccess()
          if (result.hasAccess && result.role) {
            setUserRole(result.role)
          }
        } catch (error) {
          console.error("Error in auth success callback:", error)
        }
      }, 250)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0f111a] to-[#1a1b2a] flex items-center justify-center">
        <div className="text-white text-lg">Verifying access...</div>
      </div>
    )
  }

  if (!userRole) {
    return <AdminAuth onAuthSuccess={handleAuthSuccess} />
  }

  return <>{children(userRole)}</>
}

export default AdminProtectedRoute
