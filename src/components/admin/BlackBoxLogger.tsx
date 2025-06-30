
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Terminal, Pause, Play, Download, Trash2 } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'connection' | 'api' | 'database' | 'system' | 'visit' | 'admin';
  message: string;
  details?: string;
  level: 'info' | 'warning' | 'error' | 'success';
  latency?: number; // in milliseconds
}

const BlackBoxLogger = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Simulate real-time logging with latency tracking
  useEffect(() => {
    if (isPaused) return;

    const generateRandomLog = (): LogEntry => {
      const types = ['connection', 'api', 'database', 'system', 'visit'] as const;
      const levels = ['info', 'warning', 'error', 'success'] as const;
      
      const messages = {
        connection: [
          'User connected from Pakistan (IP masked)',
          'User connected from United States (IP masked)',
          'Connection established from mobile device',
          'WebSocket connection opened',
          'User session initiated'
        ],
        api: [
          'POST /api/submitResult - 200 OK',
          'GET /api/players - 200 OK',
          'PUT /api/updateRanking - 200 OK',
          'DELETE /api/deletePlayer - 200 OK',
          'POST /api/auth/login - 200 OK',
          'GET /api/leaderboard - 200 OK',
          'PATCH /api/player/update - 200 OK'
        ],
        database: [
          'Indexing: player_stats:123456',
          'Loaded table: combat_scores',
          'Cache updated: leaderboard_data',
          'Database connection pool initialized',
          'Query executed: SELECT FROM players',
          'Index rebuild: player_rankings',
          'Backup completed: player_data'
        ],
        system: [
          'Memory usage: 45% (normal)',
          'CPU load: 23% (optimal)',
          'Cache hit ratio: 89%',
          'Background task completed',
          'System health check passed',
          'Garbage collection cycle',
          'Process cleanup completed'
        ],
        visit: [
          'New visit: device=Mobile, region=Asia',
          'Page view: /leaderboard from Desktop',
          'New visit: device=Tablet, region=Europe',
          'Search query executed',
          'User interaction logged',
          'Session timeout handled',
          'Analytics event recorded'
        ]
      };

      const type = types[Math.floor(Math.random() * types.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      let message = messages[type][Math.floor(Math.random() * messages[type].length)];
      
      // Generate realistic latency based on operation type
      let latency: number | undefined;
      const shouldIncludeLatency = Math.random() > 0.3; // 70% of operations have latency
      
      if (shouldIncludeLatency) {
        switch (type) {
          case 'api':
            latency = Math.floor(Math.random() * 800) + 50; // 50-850ms
            break;
          case 'database':
            latency = Math.floor(Math.random() * 500) + 20; // 20-520ms
            break;
          case 'connection':
            latency = Math.floor(Math.random() * 300) + 100; // 100-400ms
            break;
          case 'system':
            latency = Math.floor(Math.random() * 150) + 10; // 10-160ms
            break;
          case 'visit':
            latency = Math.floor(Math.random() * 200) + 15; // 15-215ms
            break;
          default:
            latency = Math.floor(Math.random() * 100) + 10; // 10-110ms
        }

        // Only show latency if it's above 10ms threshold
        if (latency > 10) {
          const latencyColor = latency > 500 ? 'SLOW' : latency > 200 ? 'MODERATE' : 'FAST';
          message += ` (Latency: ${latency}ms - ${latencyColor})`;
        } else {
          latency = undefined;
        }
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type,
        message,
        level,
        latency,
        details: Math.random() > 0.8 ? 'Additional context data available' : undefined
      };
    };

    const interval = setInterval(() => {
      const newLog = generateRandomLog();
      setLogs(prev => {
        const updated = [...prev, newLog];
        // Keep only last 100 logs for performance
        return updated.slice(-100);
      });
    }, Math.random() * 3000 + 1000); // Random interval between 1-4 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      total_logs: logs.length,
      logs: logs
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `black-box-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogColor = (level: string, latency?: number) => {
    // Priority: latency coloring for performance, then level coloring
    if (latency !== undefined) {
      if (latency > 500) return 'text-red-400'; // Slow
      if (latency > 200) return 'text-yellow-400'; // Moderate
      if (latency <= 200) return 'text-green-400'; // Fast
    }
    
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'connection': return '🔗';
      case 'api': return '🌐';
      case 'database': return '💾';
      case 'system': return '⚙️';
      case 'visit': return '👁️';
      case 'admin': return '🛡️';
      default: return '📝';
    }
  };

  const getLatencyBadge = (latency?: number) => {
    if (latency === undefined) return null;
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let className = "";
    
    if (latency > 500) {
      variant = "destructive";
      className = "bg-red-600/20 text-red-400 border-red-500/50";
    } else if (latency > 200) {
      variant = "outline";
      className = "bg-yellow-600/20 text-yellow-400 border-yellow-500/50";
    } else {
      variant = "outline";
      className = "bg-green-600/20 text-green-400 border-green-500/50";
    }

    return (
      <Badge variant={variant} className={`text-xs ${className}`}>
        {latency}ms
      </Badge>
    );
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg md:text-xl font-bold text-white">Black Box Monitor</h3>
          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
            {logs.length} entries
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsPaused(!isPaused)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button
            onClick={exportLogs}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            onClick={clearLogs}
            variant="destructive"
            size="sm"
            className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="admin-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm md:text-base text-white flex items-center">
              <Terminal className="h-4 w-4 mr-2" />
              Live System Activity with Latency Tracking
            </CardTitle>
            <div className="flex items-center space-x-2">
              {isPaused ? (
                <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 border-yellow-500/50">
                  PAUSED
                </Badge>
              ) : (
                <Badge variant="default" className="bg-green-600/20 text-green-400 border-green-500/50 animate-pulse">
                  LIVE
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-96 w-full" ref={scrollAreaRef}>
            <div className="space-y-1 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Waiting for system activity...
                </div>
              ) : (
                logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-start space-x-2 p-2 rounded bg-gray-900/30 border border-gray-700/30 animate-in fade-in duration-300"
                  >
                    <span className="text-xs">{getTypeIcon(log.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1 flex-wrap">
                        <span className="text-gray-500 text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs border-gray-600 ${getLogColor(log.level, log.latency)}`}
                        >
                          {log.type.toUpperCase()}
                        </Badge>
                        {getLatencyBadge(log.latency)}
                      </div>
                      <div className={`text-xs ${getLogColor(log.level, log.latency)}`}>
                        {log.message}
                      </div>
                      {log.details && (
                        <div className="text-xs text-gray-500 mt-1">
                          {log.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 text-center">
        Real-time system monitoring with latency tracking • Sensitive data automatically masked • Read-only view
      </div>
    </div>
  );
};

export default BlackBoxLogger;
