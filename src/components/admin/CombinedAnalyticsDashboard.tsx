
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnalyticsDashboard from './AnalyticsDashboard';
import DailyAnalytics from './DailyAnalytics';
import CountryAnalytics from './CountryAnalytics';
import { BarChart, Calendar, Globe } from 'lucide-react';

type AnalyticsView = 'overview' | 'daily' | 'countries';

export const CombinedAnalyticsDashboard = () => {
  const [activeView, setActiveView] = useState<AnalyticsView>('overview');

  const views = [
    { id: 'overview' as AnalyticsView, label: 'Overview', icon: BarChart },
    { id: 'daily' as AnalyticsView, label: 'Daily Stats', icon: Calendar },
    { id: 'countries' as AnalyticsView, label: 'Countries', icon: Globe }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <AnalyticsDashboard />;
      case 'daily':
        return <DailyAnalytics />;
      case 'countries':
        return <CountryAnalytics />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30">
          <BarChart className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Analytics Dashboard</h3>
          <p className="text-gray-400 text-sm">Comprehensive analytics and insights</p>
        </div>
      </div>

      {/* View Selector */}
      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Analytics Views</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {views.map((view) => (
              <Button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                variant={activeView === view.id ? "default" : "outline"}
                className={`${
                  activeView === view.id
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                    : 'bg-gray-800/40 border-gray-600/50 text-gray-300 hover:bg-gray-700/60'
                } transition-all duration-200`}
                size="sm"
              >
                <view.icon className="h-4 w-4 mr-2" />
                {view.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};
