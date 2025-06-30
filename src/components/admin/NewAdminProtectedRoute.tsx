"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { newAdminService } from "@/services/newAdminService"
import { NewAdminAuth } from "./NewAdminAuth"

interface NewAdminProtectedRouteProps {
  children: React.ReactNode
}

export const NewAdminProtectedRoute: React.FC<NewAdminProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const accessResult = await newAdminService.checkAdminAccess()

      if (accessResult.hasAccess && accessResult.role) {
        setIsAuthenticated(true)
        setUserRole(accessResult.role)
      } else {
        setIsAuthenticated(false)
        setUserRole(null)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setUserRole(null)
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

  return <>{children}</>
}
