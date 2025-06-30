import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, UserCheck, UserX, Crown, Shield, Eye, UserCog, Ban, UserPlus, Globe } from 'lucide-react';
import { newAdminService, AdminApplication } from '@/services/newAdminService';
import StaffOnboarding from './StaffOnboarding';

interface StaffMember {
  id: string;
  discord: string;
  displayName?: string;
  role: string;
  status: 'online' | 'offline';
  lastSeen: string;
  ip_address: string;
  country?: string;
  countryCode?: string;
  flag?: string;
  onboardedAt?: string;
}

interface StaffManagementProps {
  userRole: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ userRole }) => {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [activeStaff, setActiveStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({});
  const [onboardingStaff, setOnboardingStaff] = useState<any>(null);
  const { toast } = useToast();

  // Initialize staff data with enhanced structure
  const initializeStaffData = () => {
    const mockActiveStaff: StaffMember[] = [
      { 
        id: '1', 
        discord: 'admin#1234', 
        displayName: 'Admin Master',
        role: 'admin', 
        status: 'online', 
        lastSeen: '2 minutes ago', 
        ip_address: '192.168.1.100',
        country: 'United States',
        countryCode: 'US',
        flag: '🇺🇸',
        onboardedAt: '2024-01-01T00:00:00Z'
      },
      { 
        id: '2', 
        discord: 'mod#5678', 
        displayName: 'Moderator Pro',
        role: 'moderator', 
        status: 'offline', 
        lastSeen: '1 hour ago', 
        ip_address: '192.168.1.101',
        country: 'United Kingdom',
        countryCode: 'GB',
        flag: '🇬🇧',
        onboardedAt: '2024-01-02T00:00:00Z'
      },
      { 
        id: '3', 
        discord: 'tester#9012', 
        displayName: 'Test Ninja',
        role: 'tester', 
        status: 'online', 
        lastSeen: 'Just now', 
        ip_address: '192.168.1.102',
        country: 'Canada',
        countryCode: 'CA',
        flag: '🇨🇦',
        onboardedAt: '2024-01-03T00:00:00Z'
      }
    ];
    
    const existingStaff = JSON.parse(localStorage.getItem('active_staff') || JSON.stringify(mockActiveStaff));
    setActiveStaff(existingStaff);
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const data = await newAdminService.getPendingApplications();
      setApplications(data);
      
      const roles = data.reduce((acc, app) => {
        acc[app.id] = app.requested_role;
        return acc;
      }, {} as { [key: string]: string });
      setSelectedRoles(roles);
    } catch (error) {
      console.error('Fetch applications error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'owner') {
      fetchApplications();
      initializeStaffData();
    }
  }, [userRole]);

  const handleReviewApplication = async (applicationId: string, action: 'approve' | 'deny') => {
    setIsLoading(true);
    try {
      const roleToAssign = action === 'approve' ? selectedRoles[applicationId] : undefined;
      const result = await newAdminService.reviewApplicationWithRole(applicationId, action, userRole, roleToAssign);
      
      if (result.success) {
        if (action === 'approve' && roleToAssign) {
          const application = applications.find(app => app.id === applicationId);
          if (application) {
            // Start onboarding process
            setOnboardingStaff({
              id: Date.now().toString(),
              discord: application.discord,
              role: roleToAssign,
              ip_address: application.ip_address
            });
          }
        }
        
        toast({
          title: `Application ${action === 'approve' ? 'Approved' : 'Denied'}`,
          description: action === 'approve' 
            ? `User will now complete onboarding for ${roleToAssign} role.`
            : 'The application has been denied.',
        });
        await fetchApplications();
      } else {
        toast({
          title: "Review Failed",
          description: result.error || `Failed to ${action} application`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Review Error",
        description: `An error occurred while ${action}ing the application`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (staffMember: StaffMember) => {
    const updatedStaff = [...activeStaff, staffMember];
    setActiveStaff(updatedStaff);
    localStorage.setItem('active_staff', JSON.stringify(updatedStaff));
    setOnboardingStaff(null);
  };

  const handleOnboardingCancel = () => {
    setOnboardingStaff(null);
    toast({
      title: "Onboarding Cancelled",
      description: "The staff member setup was cancelled.",
      variant: "destructive"
    });
  };

  const handleRemoveStaff = async (staffId: string) => {
    try {
      const staffMember = activeStaff.find(staff => staff.id === staffId);
      if (!staffMember) return;

      const updatedStaff = activeStaff.filter(staff => staff.id !== staffId);
      setActiveStaff(updatedStaff);
      localStorage.setItem('active_staff', JSON.stringify(updatedStaff));

      toast({
        title: "Staff Removed",
        description: `${staffMember.displayName || staffMember.discord} has been removed from the team.`,
      });
    } catch (error) {
      toast({
        title: "Remove Failed",
        description: "Failed to remove staff member",
        variant: "destructive"
      });
    }
  };

  const handlePromoteStaff = async (staffId: string, newRole: string) => {
    try {
      const staffMember = activeStaff.find(staff => staff.id === staffId);
      if (!staffMember) return;

      const updatedStaff = activeStaff.map(staff => 
        staff.id === staffId ? { ...staff, role: newRole } : staff
      );
      setActiveStaff(updatedStaff);
      localStorage.setItem('active_staff', JSON.stringify(updatedStaff));

      toast({
        title: "Staff Promoted",
        description: `${staffMember.displayName || staffMember.discord} has been promoted to ${newRole}.`,
      });
    } catch (error) {
      toast({
        title: "Promotion Failed",
        description: "Failed to promote staff member",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'admin': return <Shield className="h-4 w-4 text-purple-400" />;
      case 'moderator': return <UserCheck className="h-4 w-4 text-blue-400" />;
      case 'tester': return <Eye className="h-4 w-4 text-green-400" />;
      default: return <Users className="h-4 w-4 text-gray-400" />;
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

  if (userRole !== 'owner') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <Shield className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">Access Restricted</h3>
            <p className="text-gray-400">Only owners can manage staff members.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-500/30">
            <UserCog className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Staff Management</h3>
            <p className="text-gray-400 text-sm">Manage applications and active staff members</p>
          </div>
        </div>

        {/* Active Staff */}
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-400" />
              <span>Active Staff ({activeStaff.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeStaff.map((staff) => (
                <div 
                  key={staff.id} 
                  className="group p-4 bg-gray-800/40 rounded-xl border border-gray-700/40 hover:border-gray-600/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${staff.status === 'online' ? 'bg-green-400' : 'bg-gray-500'}`} />
                        {getRoleIcon(staff.role)}
                        {staff.flag && (
                          <span className="text-lg" title={staff.country}>
                            {staff.flag}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">
                          {staff.displayName || staff.discord}
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-400">
                          <span className={getRoleColor(staff.role)}>
                            {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                          </span>
                          <span>•</span>
                          <span>Last seen: {staff.lastSeen}</span>
                          {staff.country && (
                            <>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <Globe className="h-3 w-3" />
                                <span>{staff.country}</span>
                              </span>
                            </>
                          )}
                        </div>
                        {staff.displayName && (
                          <p className="text-xs text-gray-500 mt-1">Discord: {staff.discord}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select
                        defaultValue={staff.role}
                        onValueChange={(value) => handlePromoteStaff(staff.id, value)}
                      >
                        <SelectTrigger className="w-32 bg-gray-800/60 border-gray-600/50 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="tester" className="text-green-400">Tester</SelectItem>
                          <SelectItem value="moderator" className="text-blue-400">Moderator</SelectItem>
                          <SelectItem value="admin" className="text-purple-400">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        onClick={() => handleRemoveStaff(staff.id)}
                        className="bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30"
                        size="sm"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Applications */}
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-yellow-400" />
              <span>Pending Applications ({applications.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((application) => (
                <div 
                  key={application.id} 
                  className="group p-4 bg-gray-800/40 rounded-xl border border-gray-700/40 hover:border-gray-600/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                          <UserPlus className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{application.discord}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            {getRoleIcon(application.requested_role)}
                            <span className={getRoleColor(application.requested_role)}>
                              Requested: {application.requested_role}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Applied:</span>
                          <div className="text-gray-300">
                            {new Date(application.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">IP Address:</span>
                          <div className="text-gray-300 font-mono text-xs">
                            {application.ip_address}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">
                          Assign Role
                        </label>
                        <Select
                          value={selectedRoles[application.id] || application.requested_role}
                          onValueChange={(value) => 
                            setSelectedRoles(prev => ({ ...prev, [application.id]: value }))
                          }
                        >
                          <SelectTrigger className="w-48 bg-gray-800/60 border-gray-600/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="tester" className="text-green-400">Tester</SelectItem>
                            <SelectItem value="moderator" className="text-blue-400">Moderator</SelectItem>
                            <SelectItem value="admin" className="text-purple-400">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleReviewApplication(application.id, 'approve')}
                        disabled={isLoading}
                        className="bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30"
                        size="sm"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      
                      <Button
                        onClick={() => handleReviewApplication(application.id, 'deny')}
                        disabled={isLoading}
                        className="bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30"
                        size="sm"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Deny
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {applications.length === 0 && (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-800/20 rounded-xl border border-gray-700/30 inline-block">
                    <UserPlus className="h-12 w-12 text-gray-500 mx-auto" />
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-400 mb-2">No Pending Applications</h4>
                    <p className="text-gray-500">All applications have been reviewed.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Modal */}
      {onboardingStaff && (
        <StaffOnboarding
          staffData={onboardingStaff}
          onComplete={handleOnboardingComplete}
          onCancel={handleOnboardingCancel}
        />
      )}
    </>
  );
};

export default StaffManagement;
