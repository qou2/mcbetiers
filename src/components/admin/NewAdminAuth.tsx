"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Shield, Lock, Eye, EyeOff } from "lucide-react"
import { newAdminService, clearAllAuthState } from "@/services/newAdminService"

interface NewAdminAuthProps {
  onAuthSuccess: (role: string) => void
}

export const NewAdminAuth: React.FC<NewAdminAuthProps> = ({ onAuthSuccess }) => {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()

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
      clearAllAuthState()

      const result = await newAdminService.authenticateAdmin(password, false)

      if (result.success && result.role) {
        toast({
          title: "Authentication Successful",
          description: `Welcome, ${result.role}!`,
        })
        onAuthSuccess(result.role)
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        toast({
          title: "Authentication Failed",
          description: result.error || "Invalid password",
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

  // ENTER key triggers login form submit
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handlePasswordSubmit(e as any)
    }
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter admin password"
                  className="pl-8 md:pl-10 pr-10 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/25 h-9 md:h-10 text-sm"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-700/50"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  ) : (
                    <Eye className="h-3 w-3 text-gray-400" />
                  )}
                </Button>
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

          <div className="flex flex-col gap-2">
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
            <div>Secure authentication system</div>
            <div className="text-gray-500">Multiple access levels available</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
