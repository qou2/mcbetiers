
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Globe, UserCheck, Shield, Eye, Crown } from 'lucide-react';

interface StaffOnboardingProps {
  staffData: {
    id: string;
    discord: string;
    role: string;
    ip_address: string;
  };
  onComplete: (staffMember: any) => void;
  onCancel: () => void;
}

const StaffOnboarding: React.FC<StaffOnboardingProps> = ({ staffData, onComplete, onCancel }) => {
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴' },
    { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
    { code: 'FI', name: 'Finland', flag: '🇫🇮' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹' },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
    { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
    { code: 'GR', name: 'Greece', flag: '🇬🇷' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'IL', name: 'Israel', flag: '🇮🇱' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-5 w-5 text-yellow-400" />;
      case 'admin': return <Shield className="h-5 w-5 text-purple-400" />;
      case 'moderator': return <UserCheck className="h-5 w-5 text-blue-400" />;
      case 'tester': return <Eye className="h-5 w-5 text-green-400" />;
      default: return <User className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-400';
      case 'admin': return 'text-purple-400';
      case 'moderator': return 'text-blue-400';
      case 'tester': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a display name",
        variant: "destructive"
      });
      return;
    }

    if (!country) {
      toast({
        title: "Validation Error",
        description: "Please select your country",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCountry = countries.find(c => c.code === country);
      const staffMember = {
        ...staffData,
        displayName: displayName.trim(),
        country: selectedCountry?.name || '',
        countryCode: country,
        flag: selectedCountry?.flag || '🌍',
        status: 'offline' as const,
        lastSeen: 'Never',
        onboardedAt: new Date().toISOString()
      };

      onComplete(staffMember);

      toast({
        title: "Onboarding Complete",
        description: `Welcome to the team, ${displayName}! Your ${staffData.role} role is now active.`,
      });
    } catch (error) {
      toast({
        title: "Onboarding Failed",
        description: "An error occurred during onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-900/95 backdrop-blur-xl border-gray-700/50 shadow-2xl w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-xl border border-green-500/30">
              <User className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <CardTitle className="text-xl text-white">Staff Onboarding</CardTitle>
          <p className="text-gray-400 text-sm">Complete your profile setup</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Role Information */}
          <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/40">
            <div className="flex items-center space-x-3">
              {getRoleIcon(staffData.role)}
              <div>
                <h4 className="text-white font-semibold">Role Assignment</h4>
                <p className={`text-sm ${getRoleColor(staffData.role)}`}>
                  {staffData.role.charAt(0).toUpperCase() + staffData.role.slice(1)}
                </p>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-400">
              <p><span className="font-medium">Discord:</span> {staffData.discord}</p>
              <p><span className="font-medium">IP:</span> {staffData.ip_address}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-300 font-medium">
                Display Name *
              </Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="bg-gray-800/60 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-blue-500/50"
                maxLength={50}
              />
              <p className="text-xs text-gray-500">This will be shown in the staff panel</p>
            </div>

            {/* Country Selection */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-gray-300 font-medium">
                Country *
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="bg-gray-800/60 border-gray-600/50 text-white">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 max-h-60">
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1 bg-gray-800/40 border-gray-600/50 text-gray-300 hover:bg-gray-700/60"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30"
              >
                {isSubmitting ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffOnboarding;
