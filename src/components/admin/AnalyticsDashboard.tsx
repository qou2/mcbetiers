
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Smartphone, Tablet, Users, Eye, TrendingUp } from 'lucide-react';
import { getVisitorStats, VisitorStats } from '@/services/analyticsService';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<VisitorStats>({
    totalUniqueVisits: 0,
    totalPageVisits: 0,
    pcUsers: 0,
    mobileUsers: 0,
    tabletUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const visitorStats = await getVisitorStats();
        setStats(visitorStats);
      } catch (error) {
        console.error('Error loading visitor stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-700/50 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const deviceTotal = stats.pcUsers + stats.mobileUsers + stats.tabletUsers;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-blue-600/20 to-green-600/20 rounded-lg border border-blue-500/30">
          <TrendingUp className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Analytics Overview</h3>
          <p className="text-gray-400 text-sm">Real-time visitor statistics and engagement metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Unique Visits */}
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Unique Visitors</p>
                <p className="text-2xl font-bold text-white">{stats.totalUniqueVisits.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Page Views */}
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                <Eye className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Page Views</p>
                <p className="text-2xl font-bold text-white">{stats.totalPageVisits.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PC Users */}
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                <Monitor className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Desktop Users</p>
                <p className="text-2xl font-bold text-white">{stats.pcUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {deviceTotal > 0 ? ((stats.pcUsers / deviceTotal) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Users */}
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
                <Smartphone className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Mobile Users</p>
                <p className="text-2xl font-bold text-white">{stats.mobileUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {deviceTotal > 0 ? ((stats.mobileUsers / deviceTotal) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tablet Users */}
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                <Tablet className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Tablet Users</p>
                <p className="text-2xl font-bold text-white">{stats.tabletUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {deviceTotal > 0 ? ((stats.tabletUsers / deviceTotal) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Device Users */}
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <TrendingUp className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Total Devices</p>
                <p className="text-2xl font-bold text-white">{deviceTotal.toLocaleString()}</p>
                <p className="text-xs text-gray-500">All tracked devices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
