
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Users, Eye } from 'lucide-react';
import { getDailyAnalytics, getVisitorStats, DailyStats, VisitorStats } from '@/services/analyticsService';

const DailyAnalytics = () => {
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [stats, setStats] = useState<VisitorStats>({
    totalUniqueVisits: 0,
    totalPageVisits: 0,
    pcUsers: 0,
    mobileUsers: 0,
    tabletUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [daily, visitor] = await Promise.all([
          getDailyAnalytics(30),
          getVisitorStats()
        ]);
        setDailyData(daily);
        setStats(visitor);
      } catch (error) {
        console.error('Error loading daily analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-gray-800/40 h-8 w-64 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-800/40 h-24 rounded-xl"></div>
          ))}
        </div>
        <div className="animate-pulse bg-gray-800/40 h-80 rounded-xl"></div>
      </div>
    );
  }

  const deviceTotal = stats.pcUsers + stats.mobileUsers + stats.tabletUsers;

  const summaryCards = [
    {
      title: 'Total Page Views',
      value: stats.totalPageVisits,
      icon: <Eye className="h-5 w-5 text-blue-400" />,
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Unique Visitors',
      value: stats.totalUniqueVisits,
      icon: <Users className="h-5 w-5 text-green-400" />,
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'Mobile Users',
      value: stats.mobileUsers,
      icon: <TrendingUp className="h-5 w-5 text-purple-400" />,
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Desktop Users',
      value: stats.pcUsers,
      icon: <Calendar className="h-5 w-5 text-yellow-400" />,
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
          <Calendar className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Daily Analytics</h3>
          <p className="text-gray-400 text-sm">Track daily visitor trends and engagement patterns</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 ${card.bgColor} rounded-lg border ${card.borderColor}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">{card.title}</p>
                  <p className="text-xl font-bold text-white">{card.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Trend Chart */}
      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span>Daily Visitor Trends (Last 30 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  name="Daily Visits"
                />
                <Line 
                  type="monotone" 
                  dataKey="unique_visitors" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Unique Visitors"
                />
                <Line 
                  type="monotone" 
                  dataKey="page_views" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Page Views"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No daily data available yet</p>
                <p className="text-sm text-gray-500">Data will appear as users visit the site</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyAnalytics;
