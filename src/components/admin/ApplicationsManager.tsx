
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, UserX, Clock, Users, Crown, Shield, Eye } from 'lucide-react';
import { newAdminService, AdminApplication } from '@/services/newAdminService';

interface ApplicationsManagerProps {
  userRole: string;
}

const ApplicationsManager: React.FC<ApplicationsManagerProps> = ({ userRole }) => {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const data = await newAdminService.getPendingApplications();
      setApplications(data);
      // Initialize selected roles with requested roles
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
    }
  }, [userRole]);

  const handleReviewApplication = async (applicationId: string, action: 'approve' | 'deny') => {
    setIsLoading(true);
    try {
      const roleToAssign = action === 'approve' ? selectedRoles[applicationId] : undefined;
      const result = await newAdminService.reviewApplicationWithRole(applicationId, action, userRole, roleToAssign);
      
      if (result.success) {
        toast({
          title: `Application ${action === 'approve' ? 'Approved' : 'Denied'}`,
          description: action === 'approve' 
            ? `User has been granted ${roleToAssign} role successfully.`
            : 'The application has been denied.',
          variant: action === 'approve' ? 'default' : 'destructive'
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
            <p className="text-gray-400">Only owners can manage applications.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
          <Users className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Admin Applications</h3>
          <p className="text-gray-400 text-sm">Review and manage incoming admin applications</p>
        </div>
      </div>

      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-400" />
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
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Header */}
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Clock className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg">{application.discord}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          {getRoleIcon(application.requested_role)}
                          <span className={getRoleColor(application.requested_role)}>
                            Requested: {application.requested_role}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="space-y-1">
                        <span className="text-gray-500 font-medium">Applied</span>
                        <div className="text-gray-300">
                          {new Date(application.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-500 font-medium">IP Address</span>
                        <div className="text-gray-300 font-mono text-xs">
                          {application.ip_address}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-500 font-medium">Secret Key</span>
                        <div className="text-gray-300 font-mono text-xs truncate">
                          {application.secret_key.substring(0, 20)}...
                        </div>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Assign Role (Owner Decision)
                      </label>
                      <Select
                        value={selectedRoles[application.id] || application.requested_role}
                        onValueChange={(value) => 
                          setSelectedRoles(prev => ({ ...prev, [application.id]: value }))
                        }
                      >
                        <SelectTrigger className="bg-gray-800/60 border-gray-600/50 text-white hover:border-gray-500/50 focus:border-purple-500/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="tester" className="text-green-400">
                            <div className="flex items-center space-x-2">
                              <Eye className="h-4 w-4" />
                              <span>Tester</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="moderator" className="text-blue-400">
                            <div className="flex items-center space-x-2">
                              <UserCheck className="h-4 w-4" />
                              <span>Moderator</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin" className="text-purple-400">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4" />
                              <span>Admin</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      onClick={() => handleReviewApplication(application.id, 'approve')}
                      disabled={isLoading}
                      className="bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30 hover:border-green-400/60 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                      size="sm"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Button
                      onClick={() => handleReviewApplication(application.id, 'deny')}
                      disabled={isLoading}
                      className="bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-400/60 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
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
              <div className="text-center py-12">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/20 rounded-xl border border-gray-700/30 inline-block">
                    <Users className="h-12 w-12 text-gray-500 mx-auto" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-400 mb-2">No Pending Applications</h4>
                    <p className="text-gray-500">All applications have been reviewed or no new applications have been submitted.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationsManager;
