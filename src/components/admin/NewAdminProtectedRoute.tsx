
import React, { useState, useEffect } from 'react';
import { NewAdminAuth } from './NewAdminAuth';
import { newAdminService } from '@/services/newAdminService';

interface NewAdminProtectedRouteProps {
  children: (userRole: string) => React.ReactNode;
}

export const NewAdminProtectedRoute: React.FC<NewAdminProtectedRouteProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const result = await newAdminService.checkAdminAccess();
        if (result.hasAccess && result.role) {
          setUserRole(result.role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Access check error:', error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  const handleAuthSuccess = (role: string) => {
    setUserRole(role);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0f111a] to-[#1a1b2a] flex items-center justify-center">
        <div className="text-white text-lg">Verifying access...</div>
      </div>
    );
  }

  if (!userRole) {
    return <NewAdminAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return <>{children(userRole)}</>;
};
