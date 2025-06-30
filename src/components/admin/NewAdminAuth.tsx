"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Shield, Lock, Settings } from "lucide-react"
import { newAdminService, clearAllAuthState } from "@/services/newAdminService"

interface NewAdminAuthProps {
  onAuthSuccess: (role: string) => void
}

export const NewAdminAuth: React.FC<NewAdminAuthProps> = ({ onAuthSuccess }) => {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showInitialize, setShowInitialize] = useState(false)
  const { toast } = useToast()
  const [debugInfo, setDebugInfo] = useState<any[]>([])

  // Check if auth config exists on component mount
  useEffect(() => {
    checkAuthConfig()
  }, [])

  const checkAuthConfig = async () => {
    try {
      const config = await newAdminService.getAuthConfig()
      const hasRequiredPasswords = config.owner_password && config.admin_password && config.tester_password
      setShowInitialize(!hasRequiredPasswords)
    } catch (error) {
      console.error("Error checking auth config:", error)
      setShowInitialize(true)
    }
  }

  const handleInitializePasswords = async () => {
    setIsLoading(true)
    try {
      const result = await newAdminService.initializeDefaultPasswords()
      if (result.success) {
        toast({
          title: "Success",
          description: "Default passwords have been initialized in the database",
        })
        setShowInitialize(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to initialize passwords",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Authentication submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      setDebugInfo([])
      clearAllAuthState()

      const result = await newAdminService.authenticateAdmin(password, true)

      if (result.success && result.role) {
        setDebugInfo(result.debug || [])
        toast({
          title: "Authentication Successful",
          description: `Welcome, ${result.role}!`,
        })
        onAuthSuccess(result.role)
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        setDebugInfo(result.debug || [])
        toast({
          title: "Authentication Failed",
          description: result.error || "Invalid password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[ADMIN DEBUG] Login error (frontend):", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ENTER key triggers login form submit
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handlePasswordSubmit(e as any)
    }
  }

  if (showInitialize) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0f111a] to-[#1a1b2a] flex items-center justify-center p-3 md:p-4">
        <Card className="w-full max-w-sm md:max-w-md bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardHeader className="text-center space-y-2 md:space-y-3 pb-3 md:pb-4">
            <div className="flex justify-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-full">
                <Settings className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-base md:text-lg lg:text-2xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
              Initialize Auth System
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs md:text-sm">
              The authentication system needs to be initialized with default passwords
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 space-y-3 md:space-y-4">
            <div className="text-xs text-gray-300 bg-gray-800/50 p-3 rounded-lg border border-gray-600/50">
              <div className="font-medium mb-2">Default passwords will be created:</div>
              <ul className="space-y-1 text-gray-400">
                <li>• Owner: </li>
                <li>• Admin: </li>
                <li>• Tester: </li>
                <li>• Moderator: </li>
              </ul>
            </div>

            <Button
              onClick={handleInitializePasswords}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-2 md:py-2.5 px-3 md:px-4 rounded-lg transition-all duration-300 h-9 md:h-10 text-sm"
              disabled={isLoading}
            >
              {isLoading ? "Initializing..." : "Initialize Default Passwords"}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowInitialize(false)}
              className="w-full border border-gray-400/30 text-gray-300 hover:bg-gray-700/40 h-8 md:h-9 text-xs md:text-sm"
              disabled={isLoading}
            >
              Skip (Try Login Anyway)
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0f111a] to-[#1a1b2a] flex items-center justify-center p-3 md:p-4">
      <Card className="w-full max-w-sm md:max-w-md bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
        <CardHeader className="text-center space-y-2 md:space-y-3 pb-3 md:pb-4">
          <div className="flex justify-center">
            <div className="p-2 md:p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full">
              <Shield className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-base md:text-lg lg:text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Admin Access
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs md:text-sm">
            Enter your admin password to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 space-y-3 md:space-y-4">
          <form onSubmit={handlePasswordSubmit} className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs md:text-sm font-medium text-gray-300">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter admin password"
                  className="pl-8 md:pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/25 h-9 md:h-10 text-sm"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 md:py-2.5 px-3 md:px-4 rounded-lg transition-all duration-300 h-9 md:h-10 text-sm"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Access Admin Panel"}
            </Button>
          </form>

          {debugInfo && debugInfo.length > 0 && (
            <div className="mt-3 max-h-24 md:max-h-32 overflow-y-auto p-2 text-xs rounded bg-gray-900/60 text-sky-200 border border-sky-400/20">
              <b>Debug Info:</b>
              <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowInitialize(true)}
              className="w-full border border-purple-400/20 text-purple-300 hover:bg-purple-800/30 h-8 md:h-9 text-xs md:text-sm"
              type="button"
              disabled={isLoading}
            >
              Initialize Auth System
            </Button>
            <Button
              variant="ghost"
              className="w-full border border-gray-400/30 text-gray-300 hover:bg-gray-700/40 h-8 md:h-9 text-xs md:text-sm"
              onClick={() => window.location.reload()}
              type="button"
              disabled={isLoading}
            >
              Reload Page
            </Button>
          </div>

          <div className="text-xs text-center text-gray-400/80 space-y-1">
            <div>Passwords stored in database auth_config table</div>
            <div className="text-gray-500">• Owner • Admin • Moderator • Tester</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
