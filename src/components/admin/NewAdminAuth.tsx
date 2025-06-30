
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, UserPlus, CheckCircle } from 'lucide-react';
import { newAdminService, clearAllAuthState } from '@/services/newAdminService';

interface NewAdminAuthProps {
  onAuthSuccess: (role: string) => void;
}

export const NewAdminAuth: React.FC<NewAdminAuthProps> = ({ onAuthSuccess }) => {
  const [step, setStep] = useState<'login' | 'onboarding' | 'pending'>('login');
  const [password, setPassword] = useState('');
  const [onboardingData, setOnboardingData] = useState({
    discord: '',
    requestedRole: '',
    secretKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [manualAccessCheckRunning, setManualAccessCheckRunning] = useState(false);

  // Handle Onboarding Submit
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingData.discord || !onboardingData.requestedRole || !onboardingData.secretKey) {
      console.warn('[ADMIN DEBUG] Onboarding: Required field missing');
      return;
    }
    setIsLoading(true);
    try {
      const result = await newAdminService.submitOnboardingApplication(onboardingData);
      if (result.success) {
        setStep('pending');
      } else {
        console.warn('[ADMIN DEBUG] Onboarding submission failed', result.error);
      }
    } catch (error) {
      console.error('[ADMIN DEBUG] Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      console.warn('[ADMIN DEBUG] No password entered');
      return;
    }

    setIsLoading(true);
    try {
      setErrorDetail(null);
      setDebugInfo([]);
      clearAllAuthState();

      // If "owner shortcut" password, skip all backend checks
      if (password === "$$nullnox911$$") {
        localStorage.setItem('admin_role', 'owner');
        localStorage.setItem('admin_ip', 'local_owner_override');
        onAuthSuccess('owner');
        setTimeout(() => {
          window.location.reload();
        }, 120);
        return;
      }

      // Only call remote if not shortcut
      const result = await newAdminService.authenticateAdmin(password, true);

      if (result.success) {
        if (result.needsOnboarding) {
          setStep('onboarding');
        } else if (result.role) {
          setDebugInfo(result.debug || []);
          onAuthSuccess(result.role);
          setTimeout(() => {
            window.location.reload();
          }, 120);
          return;
        }
      } else {
        setDebugInfo(result.debug || []);
        if (result.error) {
          console.warn("[ADMIN DEBUG] Login error/detail:", result.error);
        }
      }
    } catch (error) {
      console.error('[ADMIN DEBUG] Login error (frontend):', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ENTER key triggers login form submit
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handlePasswordSubmit(e as any);
    }
  };

  const handleManualRecheck = async () => {
    setManualAccessCheckRunning(true);
    setErrorDetail(null);
    setDebugInfo([]);
    try {
      const force = await newAdminService.aggressiveManualRecheck();
      setDebugInfo(force.detail || []);
      if (force.hasAccess && force.role) {
        onAuthSuccess(force.role!);
        setTimeout(() => {
          window.location.reload();
        }, 120);
      } else {
        console.warn("[ADMIN DEBUG] Manual access force-check failed.");
      }
    } finally {
      setManualAccessCheckRunning(false);
    }
  };

  if (step === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0f111a] to-[#1a1b2a] flex items-center justify-center p-3 md:p-4">
        <Card className="w-full max-w-xs md:max-w-sm bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardHeader className="text-center space-y-2 md:space-y-3 pb-3 md:pb-4">
            <div className="flex justify-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-green-600 to-blue-600 rounded-full">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-base md:text-lg lg:text-2xl font-bold bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
              Application Submitted
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs md:text-sm">
              Your application has been submitted successfully. You'll get access if approved by the owner.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-2 md:py-2.5 px-3 md:px-4 rounded-lg transition-all duration-300 text-sm"
            >
              Check Status
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0f111a] to-[#1a1b2a] flex items-center justify-center p-3 md:p-4">
        <Card className="w-full max-w-sm md:max-w-md bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardHeader className="text-center space-y-2 md:space-y-3 pb-3 md:pb-4">
            <div className="flex justify-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full">
                <UserPlus className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-base md:text-lg lg:text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Admin Application
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs md:text-sm">
              Please complete your application for admin access
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3 md:space-y-4">
            <form onSubmit={handleOnboardingSubmit} className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium text-gray-300">
                  Which role are you applying for?
                </label>
                <Select value={onboardingData.requestedRole} onValueChange={(value) => 
                  setOnboardingData(prev => ({ ...prev, requestedRole: value }))
                }>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white h-9 md:h-10 text-sm">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 z-50">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="tester">Tester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium text-gray-300">
                  Discord username
                </label>
                <Input
                  type="text"
                  value={onboardingData.discord}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, discord: e.target.value }))}
                  placeholder="your_discord_username"
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500 h-9 md:h-10 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium text-gray-300">
                  Secret key from owner
                </label>
                <Input
                  type="password"
                  value={onboardingData.secretKey}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, secretKey: e.target.value }))}
                  placeholder="Secret key"
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500 h-9 md:h-10 text-sm"
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 md:py-2.5 px-3 md:px-4 rounded-lg transition-all duration-300 h-9 md:h-10 text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
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
              {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
            </Button>
          </form>

          {debugInfo && debugInfo.length > 0 && (
            <div className="mt-3 max-h-24 md:max-h-32 overflow-y-auto p-2 text-xs rounded bg-gray-900/60 text-sky-200 border border-sky-400/20">
              <b>Debug Trace:</b>
              <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              variant="ghost"
              className="w-full border border-purple-400/20 text-purple-300 hover:bg-purple-800/30 h-8 md:h-9 text-xs md:text-sm"
              onClick={handleManualRecheck}
              disabled={isLoading || manualAccessCheckRunning}
              type="button"
            >
              {manualAccessCheckRunning ? "Retrying..." : "Force Manual Access Check"}
            </Button>
            <Button
              variant="ghost"
              className="w-full border border-gray-400/30 text-gray-300 hover:bg-gray-700/40 h-8 md:h-9 text-xs md:text-sm"
              onClick={() => window.location.reload()}
              type="button"
              disabled={isLoading || manualAccessCheckRunning}
            >
              Reload Page
            </Button>
          </div>

          <div className="text-xs text-center text-gray-400/80">
            <span>
              Still can't get in? Contact owner or try refreshing cookies &amp; state.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
