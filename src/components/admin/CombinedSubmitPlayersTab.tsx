
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubmitResultsForm } from './SubmitResultsForm';
import { ManagePlayersTab } from './ManagePlayersTab';
import { UploadCloud, Users } from 'lucide-react';

type SubmitPlayersView = 'submit' | 'manage';

export const CombinedSubmitPlayersTab = () => {
  const [activeView, setActiveView] = useState<SubmitPlayersView>('submit');

  const views = [
    { id: 'submit' as SubmitPlayersView, label: 'Submit Results', icon: UploadCloud },
    { id: 'manage' as SubmitPlayersView, label: 'Manage Players', icon: Users }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'submit':
        return <SubmitResultsForm />;
      case 'manage':
        return <ManagePlayersTab />;
      default:
        return <SubmitResultsForm />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
          <Users className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Players & Results</h3>
          <p className="text-gray-400 text-sm">Submit results and manage player accounts</p>
        </div>
      </div>

      {/* View Selector */}
      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Management Tools</CardTitle>
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
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-400'
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

      {/* Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};
