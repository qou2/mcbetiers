
import React, { useState } from 'react';
import { NewAdminProtectedRoute } from '@/components/admin/NewAdminProtectedRoute';
import { CombinedSubmitPlayersTab } from '@/components/admin/CombinedSubmitPlayersTab';
import UnifiedSystemConsole from '@/components/admin/UnifiedSystemConsole';
import UnifiedUserPlayerManagement from '@/components/admin/UnifiedUserPlayerManagement';
import { CombinedAnalyticsDashboard } from '@/components/admin/CombinedAnalyticsDashboard';
import DatabaseTools from '@/components/admin/DatabaseTools';
import StaffManagement from '@/components/admin/StaffManagement';
import AdminNavigation, { AdminTab } from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  LogOut, 
  Menu, 
  X,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { newAdminService } from '@/services/newAdminService';

// Role-based tab visibility
const getVisibleTabs = (role: string): AdminTab[] => {
  switch (role) {
    case 'owner':
      return ['submit', 'system', 'analytics', 'database', 'users', 'applications'];
    case 'admin':
      return ['submit', 'system', 'analytics', 'database', 'users'];
    case 'moderator':
      return ['submit', 'analytics', 'system'];
    case 'tester':
      return ['submit'];
    default:
      return [];
  }
};

const NewAdminPanel = () => {
  return (
    <NewAdminProtectedRoute>
      {(userRole: string) => <AdminPanelContent userRole={userRole} />}
    </NewAdminProtectedRoute>
  );
};

const AdminPanelContent = ({ userRole }: { userRole: string }) => {
  const visibleTabs = getVisibleTabs(userRole);
  const [activeTab, setActiveTab] = useState<AdminTab>(visibleTabs[0] || 'submit');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    newAdminService.clearAllAuthState();
    toast({
      title: "Logged out",
      description: "You have been logged out and all sessions cleared.",
    });
    window.location.href = '/';
  };

  const handleClearAllSessions = async () => {
    if (userRole !== 'owner') {
      toast({
        title: "Access Denied",
        description: "Only owners can clear all admin sessions.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await newAdminService.clearAllAdminSessions();
      if (result.success) {
        toast({
          title: "Sessions Cleared",
          description: "All admin sessions have been cleared. All admins will need to re-authenticate.",
        });
      } else {
        toast({
          title: "Clear Failed",
          description: result.error || "Failed to clear sessions",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while clearing sessions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'submit':
        return <CombinedSubmitPlayersTab />;
      case 'system':
        return userRole === 'owner' || userRole === 'admin' || userRole === 'moderator' ? (
          <UnifiedSystemConsole />
        ) : <div className="text-center py-8 text-gray-400">Access denied for your role.</div>;
      case 'analytics':
        return <CombinedAnalyticsDashboard />;
      case 'database':
        return userRole === 'owner' || userRole === 'admin' ? <DatabaseTools /> : 
          <div className="text-center py-8 text-gray-400">Access denied for your role.</div>;
      case 'users':
        return userRole === 'owner' || userRole === 'admin' ? <UnifiedUserPlayerManagement /> : 
          <div className="text-center py-8 text-gray-400">Access denied for your role.</div>;
      case 'applications':
        return userRole === 'owner' ? <StaffManagement userRole={userRole} /> : 
          <div className="text-center py-8 text-gray-400">Access denied. Only owners can manage applications.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0f111a] to-[#1a1b2a] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-48 md:h-48 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-64 md:h-64 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-4 md:mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md md:rounded-lg">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-400 text-xs md:text-sm">
                    Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 md:space-x-2">
                {/* Mobile Menu Toggle */}
                {isMobile && (
                  <Button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    variant="ghost" 
                    size="sm"
                    className="text-white/70 hover:text-white p-1.5"
                  >
                    {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </Button>
                )}
                
                {/* Desktop Controls */}
                {!isMobile && (
                  <>
                    {userRole === 'owner' && (
                      <Button 
                        onClick={handleClearAllSessions}
                        disabled={isLoading}
                        variant="destructive" 
                        size="sm"
                        className="bg-orange-600/20 border border-orange-500/50 text-orange-400 hover:bg-orange-600/30 text-xs px-2 py-1"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        <span className="hidden lg:inline">Clear Sessions</span>
                      </Button>
                    )}
                    
                    <Button 
                      onClick={handleLogout}
                      variant="destructive" 
                      size="sm"
                      className="bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 text-xs px-2 py-1"
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      <span className="hidden lg:inline">Logout</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="space-y-4">
            {/* Navigation */}
            <div className="space-y-3">
              <h2 className="text-sm md:text-lg font-bold text-white text-center">Administrative Controls</h2>
              
              <AdminNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userRole={userRole}
                visibleTabs={visibleTabs}
                isMobile={isMobile}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />

              {/* Mobile Action Buttons */}
              {isMobile && mobileMenuOpen && (
                <div className="space-y-2 p-3 bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl">
                  {userRole === 'owner' && (
                    <Button 
                      onClick={handleClearAllSessions}
                      disabled={isLoading}
                      className="w-full bg-orange-600/20 border border-orange-500/50 text-orange-400 hover:bg-orange-600/30"
                      size="sm"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear All Sessions
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleLogout}
                    variant="destructive" 
                    className="w-full bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30"
                    size="sm"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
            
            {/* Content Area */}
            <div className="relative">
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-3 md:p-6 shadow-2xl overflow-x-auto">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default NewAdminPanel;
