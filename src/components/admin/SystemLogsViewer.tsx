
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { deepSeekService } from '@/services/deepSeekService';
import { Download, Trash2, RefreshCw, Search, Activity, Database, Globe, User, AlertTriangle } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  context?: any;
  stack?: string;
  url?: string;
  userAgent?: string;
  category?: 'api' | 'database' | 'ui' | 'auth' | 'system';
  operation?: string;
  duration?: number;
}

export const SystemLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiMetrics, setApiMetrics] = useState(deepSeekService.getApiMetrics());

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(() => {
      refreshLogs();
      setApiMetrics(deepSeekService.getApiMetrics());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, levelFilter, categoryFilter, searchTerm]);

  const refreshLogs = () => {
    const allLogs = deepSeekService.getLogs({ limit: 1000 });
    setLogs(allLogs);
  };

  const applyFilters = () => {
    let filtered = [...logs];
    
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(term) ||
        (log.context && JSON.stringify(log.context).toLowerCase().includes(term))
      );
    }
    
    setFilteredLogs(filtered);
  };

  const clearLogs = () => {
    deepSeekService.clearLogs();
    setLogs([]);
    setFilteredLogs([]);
    setApiMetrics(deepSeekService.getApiMetrics());
  };

  const exportLogs = () => {
    const logsData = deepSeekService.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      case 'debug': return 'outline';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'api': return <Globe className="h-3 w-3" />;
      case 'database': return <Database className="h-3 w-3" />;
      case 'ui': return <User className="h-3 w-3" />;
      case 'system': return <AlertTriangle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getCategoryStats = () => {
    const stats = {
      api: logs.filter(log => log.category === 'api').length,
      database: logs.filter(log => log.category === 'database').length,
      ui: logs.filter(log => log.category === 'ui').length,
      system: logs.filter(log => log.category === 'system').length,
      error: logs.filter(log => log.level === 'error').length
    };
    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="space-y-6">
      {/* API Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">API Calls</span>
            </div>
            <div className="text-2xl font-bold text-white">{apiMetrics.totalCalls}</div>
            <div className="text-xs text-gray-400">{apiMetrics.callsPerMinute}/min</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-400">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">DB Operations</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.database}</div>
            <div className="text-xs text-gray-400">Last hour</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Errors</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.error}</div>
            <div className="text-xs text-gray-400">{apiMetrics.errorRate.toFixed(1)}% rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-purple-400">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">Total Logs</span>
            </div>
            <div className="text-2xl font-bold text-white">{logs.length}</div>
            <div className="text-xs text-gray-400">Live tracking</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Viewer */}
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">System Logs & Operations</CardTitle>
              <CardDescription className="text-gray-400">
                Real-time monitoring of API calls, database operations, and system events
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={refreshLogs} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportLogs} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="destructive" size="sm" onClick={clearLogs} className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex space-x-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                />
              </div>
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32 bg-gray-800/50 border-gray-600/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32 bg-gray-800/50 border-gray-600/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="ui">UI</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-96 w-full">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No logs match your filters
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log, index) => (
                  <div key={index} className="border border-gray-700/50 rounded-lg p-3 space-y-2 bg-gray-800/20">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getLevelColor(log.level)} className="text-xs">
                          {log.level.toUpperCase()}
                        </Badge>
                        {log.category && (
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300 flex items-center gap-1">
                            {getCategoryIcon(log.category)}
                            {log.category}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        {log.duration && (
                          <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                            {log.duration}ms
                          </Badge>
                        )}
                      </div>
                      {log.url && (
                        <span className="text-xs text-gray-500 truncate max-w-xs">
                          {new URL(log.url).pathname}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm font-medium text-white">
                      {log.message}
                    </div>
                    
                    {log.context && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                          Context & Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-900/50 rounded text-xs overflow-x-auto text-gray-300">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </details>
                    )}
                    
                    {log.stack && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                          Stack Trace
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-900/50 rounded text-xs overflow-x-auto text-red-300">
                          {log.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
