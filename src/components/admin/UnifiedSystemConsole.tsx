
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Terminal, 
  Pause, 
  Play, 
  Download, 
  Trash2, 
  Send,
  Database,
  Upload,
  FileText,
  Activity,
  Wrench
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'connection' | 'api' | 'database' | 'system' | 'visit' | 'admin' | 'mass_submission';
  message: string;
  details?: string;
  level: 'info' | 'warning' | 'error' | 'success';
  latency?: number;
}

const UnifiedSystemConsole = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [massSubmissionData, setMassSubmissionData] = useState('');
  const [selectedGamemode, setSelectedGamemode] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Simulate real-time logging with mass submission events
  useEffect(() => {
    if (isPaused) return;

    const generateRandomLog = (): LogEntry => {
      const types = ['connection', 'api', 'database', 'system', 'visit', 'mass_submission'] as const;
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
          'POST /api/auth/login - 200 OK'
        ],
        database: [
          'Indexing: player_stats:123456',
          'Loaded table: combat_scores',
          'Cache updated: leaderboard_data',
          'Database connection pool initialized',
          'Query executed: SELECT FROM players'
        ],
        system: [
          'Memory usage: 45% (normal)',
          'CPU load: 23% (optimal)',
          'Cache hit ratio: 89%',
          'Background task completed',
          'System health check passed'
        ],
        visit: [
          'New visit: device=Mobile, region=Asia',
          'Page view: /leaderboard from Desktop',
          'New visit: device=Tablet, region=Europe',
          'Search query executed',
          'User interaction logged'
        ],
        mass_submission: [
          'Mass submission: 15 results processed',
          'Batch upload: 8 players updated',
          'Mass operation: rankings recalculated',
          'Bulk import: 23 new entries added',
          'Mass update: leaderboard synchronized'
        ]
      };

      const type = types[Math.floor(Math.random() * types.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      let message = messages[type][Math.floor(Math.random() * messages[type].length)];
      
      let latency: number | undefined;
      const shouldIncludeLatency = Math.random() > 0.3;
      
      if (shouldIncludeLatency) {
        switch (type) {
          case 'api':
            latency = Math.floor(Math.random() * 800) + 50;
            break;
          case 'database':
            latency = Math.floor(Math.random() * 500) + 20;
            break;
          case 'mass_submission':
            latency = Math.floor(Math.random() * 2000) + 500;
            break;
          default:
            latency = Math.floor(Math.random() * 200) + 10;
        }

        if (latency > 10) {
          const latencyColor = latency > 500 ? 'SLOW' : latency > 200 ? 'MODERATE' : 'FAST';
          message += ` (${latency}ms - ${latencyColor})`;
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
        return updated.slice(-100);
      });
    }, Math.random() * 3000 + 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleMassSubmission = async () => {
    if (!massSubmissionData.trim() || !selectedGamemode) {
      toast({
        title: "Validation Error",
        description: "Please provide submission data and select a gamemode",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Add log entry for mass submission
      const submissionLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type: 'mass_submission',
        message: `Mass submission started: ${selectedGamemode} gamemode`,
        level: 'info',
        details: `Processing ${massSubmissionData.split('\n').length} entries`
      };
      setLogs(prev => [...prev, submissionLog]);

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const successLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type: 'mass_submission',
        message: `Mass submission completed successfully`,
        level: 'success',
        latency: 1850
      };
      setLogs(prev => [...prev, successLog]);

      toast({
        title: "Mass Submission Complete",
        description: `Successfully processed submission for ${selectedGamemode}`,
      });

      setMassSubmissionData('');
      setSelectedGamemode('');
    } catch (error) {
      const errorLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type: 'mass_submission',
        message: `Mass submission failed: ${error}`,
        level: 'error'
      };
      setLogs(prev => [...prev, errorLog]);

      toast({
        title: "Submission Failed",
        description: "An error occurred during mass submission",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    a.download = `system-console-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogColor = (level: string, latency?: number) => {
    if (latency !== undefined) {
      if (latency > 500) return 'text-red-400';
      if (latency > 200) return 'text-yellow-400';
      if (latency <= 200) return 'text-green-400';
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
      case 'mass_submission': return '📤';
      default: return '📝';
    }
  };

  const getLatencyBadge = (latency?: number) => {
    if (latency === undefined) return null;
    
    let className = "";
    
    if (latency > 500) {
      className = "bg-red-600/20 text-red-400 border-red-500/50";
    } else if (latency > 200) {
      className = "bg-yellow-600/20 text-yellow-400 border-yellow-500/50";
    } else {
      className = "bg-green-600/20 text-green-400 border-green-500/50";
    }

    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        {latency}ms
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-lg border border-orange-500/30">
          <Wrench className="h-6 w-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">System Management & Monitoring</h3>
          <p className="text-gray-400 text-sm">Mass tools, logs, and live system monitoring</p>
        </div>
      </div>

      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">System Console</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="logs" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
              <TabsTrigger value="logs" className="text-xs md:text-sm">
                <Terminal className="h-4 w-4 mr-1 md:mr-2" />
                <span>Live Logs</span>
              </TabsTrigger>
              <TabsTrigger value="mass" className="text-xs md:text-sm">
                <Database className="h-4 w-4 mr-1 md:mr-2" />
                <span>Mass Tools</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="logs" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-5 w-5 text-purple-400" />
                    <h4 className="text-lg font-bold text-white">Live System Activity</h4>
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 mr-2" />
                    <span className="text-sm text-white">System Activity Feed</span>
                  </div>
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
                                {log.type.toUpperCase().replace('_', ' ')}
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
              </div>
            </TabsContent>
            
            <TabsContent value="mass" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  <h4 className="text-lg font-bold text-white">Mass Submission Tools</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Gamemode</label>
                    <Select value={selectedGamemode} onValueChange={setSelectedGamemode}>
                      <SelectTrigger className="bg-gray-800/60 border-gray-600/50 text-white">
                        <SelectValue placeholder="Select gamemode" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="bedwars">Bedwars</SelectItem>
                        <SelectItem value="skywars">Skywars</SelectItem>
                        <SelectItem value="duels">Duels</SelectItem>
                        <SelectItem value="bridge">Bridge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Submission Data</label>
                    <Textarea
                      value={massSubmissionData}
                      onChange={(e) => setMassSubmissionData(e.target.value)}
                      placeholder="Enter submission data (one entry per line)..."
                      className="bg-gray-800/60 border-gray-600/50 text-white min-h-32"
                    />
                  </div>
                  <Button
                    onClick={handleMassSubmission}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Processing...' : 'Submit Data'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 text-center">
        Real-time system monitoring with mass operations • Sensitive data automatically masked • Live activity feed
      </div>
    </div>
  );
};

export default UnifiedSystemConsole;
