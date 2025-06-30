
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Upload, 
  BarChart3, 
  Database, 
  Users, 
  UserCheck,
  Wrench
} from 'lucide-react';

export type AdminTab = 'submit' | 'system' | 'analytics' | 'database' | 'users' | 'applications';

interface AdminNavigationProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  userRole: string;
  visibleTabs: AdminTab[];
  isMobile: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  visibleTabs,
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const tabConfig = {
    submit: { icon: Upload, label: 'Submit', color: 'blue' },
    system: { icon: Wrench, label: 'System', color: 'orange' },
    analytics: { icon: BarChart3, label: 'Analytics', color: 'green' },
    database: { icon: Database, label: 'Database', color: 'purple' },
    users: { icon: Users, label: 'Users', color: 'teal' },
    applications: { icon: UserCheck, label: 'Applications', color: 'indigo' }
  };

  const handleTabClick = (tab: AdminTab) => {
    setActiveTab(tab);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const getButtonClass = (tab: AdminTab, color: string) => {
    const isActive = activeTab === tab;
    const baseClass = "transition-all duration-200 text-xs md:text-sm";
    
    if (isActive) {
      return `${baseClass} bg-${color}-600/30 border border-${color}-500/50 text-${color}-400 shadow-lg`;
    }
    return `${baseClass} bg-gray-800/40 border border-gray-600/30 text-gray-300 hover:bg-gray-700/50 hover:text-white`;
  };

  if (isMobile) {
    return (
      <>
        {mobileMenuOpen && (
          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 p-3">
            <div className="grid grid-cols-2 gap-2">
              {visibleTabs.map((tab) => {
                const config = tabConfig[tab];
                const Icon = config.icon;
                return (
                  <Button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={getButtonClass(tab, config.color)}
                    size="sm"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </Card>
        )}
      </>
    );
  }

  return (
    <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 p-3">
      <div className="flex flex-wrap gap-2 justify-center">
        {visibleTabs.map((tab) => {
          const config = tabConfig[tab];
          const Icon = config.icon;
          return (
            <Button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={getButtonClass(tab, config.color)}
              size="sm"
            >
              <Icon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{config.label}</span>
              <span className="sm:hidden">{config.label.slice(0, 4)}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default AdminNavigation;
