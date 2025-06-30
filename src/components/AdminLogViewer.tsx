
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { deepSeekService } from '@/services/deepSeekService';
import { Download, Trash2, RefreshCw } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  context?: any;
  stack?: string;
  url?: string;
  userAgent?: string;
}

export const AdminLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const refreshLogs = () => {
    setLogs(deepSeekService.getLogs());
  };

  const clearLogs = () => {
    deepSeekService.clearLogs();
    setLogs([]);
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

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.level === filter
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      case 'debug': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>System Logs & DeepSeek Analysis</CardTitle>
            <CardDescription>
              Real-time error tracking with AI analysis ({logs.length} entries)
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={refreshLogs}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="destructive" size="sm" onClick={clearLogs}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          {['all', 'error', 'warning', 'info', 'debug'].map(level => (
            <Button
              key={level}
              variant={filter === level ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
              {level !== 'all' && (
                <Badge variant="secondary" className="ml-1">
                  {logs.filter(log => log.level === level).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96 w-full">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No logs to display
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.reverse().map((log, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getLevelColor(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {log.url && (
                      <span className="text-xs text-muted-foreground truncate max-w-xs">
                        {new URL(log.url).pathname}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm font-medium">
                    {log.message}
                  </div>
                  
                  {log.context && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Context
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {log.stack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
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
  );
};
