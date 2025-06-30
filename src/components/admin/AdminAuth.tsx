import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, UserPlus, CheckCircle } from 'lucide-react';
import { adminService } from '@/services/adminService';

interface AdminAuthProps {
  onAuthSuccess: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthSuccess }) => {
  const [step, setStep] = useState<'login' | 'onboarding' | 'pending'>('login');
  const [password, setPassword] = useState('');
  const [onboardingData, setOnboardingData] = useState({
    discord: '',
    requestedRole: '',
    secretKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter your admin password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Submitting password for authentication...');
      const result = await adminService.adminLogin(password.trim());
      console.log('Login result:', result);
      
      if (result.success) {
        if (result.needsOnboarding) {
          console.log('Needs onboarding, switching to onboarding step');
          setStep('onboarding');
        } else if (result.role) {
          // Mark session as active for this login
          localStorage.setItem('admin_session_active', 'true');
          console.log('Login successful with role:', result.role);
          toast({
            title: "Login Successful",
            description: `Welcome, ${result.role}!`,
          });
          // Small delay to ensure state is updated
          setTimeout(() => {
            onAuthSuccess();
          }, 100);
        }
      } else {
        console.log('Login failed:', result.error);
        toast({
          title: "Login Failed",
          description: result.error || "Invalid password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handlePasswordSubmit(e as any);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingData.discord || !onboardingData.requestedRole || !onboardingData.secretKey) {
      toast({
        title: "All Fields Required",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminService.submitOnboardingApplication(onboardingData);
      
      if (result.success) {
        setStep('pending');
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted for review",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit application",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Submission Error",
        description: "An error occurred during submission",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0f111a] to-[#1a1b2a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-br from-green-600 to-blue-600 rounded-full">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
              Application Submitted
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your application has been submitted successfully. You'll get access if approved by the owner.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0f111a] to-[#1a1b2a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Admin Application
            </CardTitle>
            <CardDescription className="text-gray-400">
              Please complete your application for admin access
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Which role are you applying for?
                </label>
                <Select value={onboardingData.requestedRole} onValueChange={(value) => 
                  setOnboardingData(prev => ({ ...prev, requestedRole: value }))
                }>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="tester">Tester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  What is your Discord username?
                </label>
                <Input
                  type="text"
                  value={onboardingData.discord}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, discord: e.target.value }))}
                  placeholder="your_discord_username"
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Enter the secret key you got from the owner
                </label>
                <Input
                  type="password"
                  value={onboardingData.secretKey}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, secretKey: e.target.value }))}
                  placeholder="Secret key"
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0f111a] to-[#1a1b2a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Admin Access
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter your admin password to access the dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter admin password"
                  className="pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/25"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
