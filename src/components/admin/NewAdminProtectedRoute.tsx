"use client"

import type React from "react"
import { useState, useEffect } from "react"
import NewAdminAuth from "./NewAdminAuth"
import { newAdminService } from "@/services/newAdminService"

interface NewAdminProtectedRouteProps {
  children: (userRole: string) => React.ReactNode
}

const NewAdminProtectedRoute: React.FC<NewAdminProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const sessionToken = localStorage.getItem("admin_session_token")

      if (sessionToken) {
        const isValid = await newAdminService.verifyAdminSession(sessionToken)
        if (isValid) {
          const result = await newAdminService.checkAdminAccess()
          if (result.hasAccess && result.role) {
            setIsAuthenticated(true)
            setUserRole(result.role)
          }
        }
      }
    } catch (error) {
      // Silent fail - user will see login screen
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = (role: string) => {
    setIsAuthenticated(true)
    setUserRole(role)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0f111a] to-[#1a1b2a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <NewAdminAuth onAuthSuccess={handleAuthSuccess} />
  }

  return <>{children(userRole)}</>
}

export default NewAdminProtectedRoute
