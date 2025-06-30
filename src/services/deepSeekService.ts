
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

interface DeepSeekAnalysis {
  reasoning: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedFix: string;
  category: string;
}

interface ApiCallMetrics {
  totalCalls: number;
  callsPerMinute: number;
  lastMinuteCalls: number[];
  errorRate: number;
  averageResponseTime: number;
}

class DeepSeekService {
  private apiKey = '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';
  private baseUrl = 'https://api.deepseek.com/v1';
  private logs: LogEntry[] = [];
  private apiMetrics: ApiCallMetrics = {
    totalCalls: 0,
    callsPerMinute: 0,
    lastMinuteCalls: [],
    errorRate: 0,
    averageResponseTime: 0
  };

  constructor() {
    // Start metrics collection
    this.startMetricsCollection();
  }

  private startMetricsCollection() {
    setInterval(() => {
      this.updateMetrics();
    }, 60000); // Update every minute
  }

  private updateMetrics() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Filter calls from the last minute
    const recentCalls = this.logs.filter(log => 
      log.category === 'api' && 
      new Date(log.timestamp).getTime() > oneMinuteAgo
    );
    
    this.apiMetrics.lastMinuteCalls.push(recentCalls.length);
    if (this.apiMetrics.lastMinuteCalls.length > 60) {
      this.apiMetrics.lastMinuteCalls.shift(); // Keep only last 60 minutes
    }
    
    this.apiMetrics.callsPerMinute = recentCalls.length;
    
    // Calculate error rate
    const errors = this.logs.filter(log => log.level === 'error' && log.category === 'api');
    this.apiMetrics.errorRate = this.apiMetrics.totalCalls > 0 ? 
      (errors.length / this.apiMetrics.totalCalls) * 100 : 0;

    console.log('API Metrics Updated:', this.apiMetrics);
  }

  async analyzeError(error: any, context?: any): Promise<DeepSeekAnalysis> {
    try {
      const errorInfo = {
        message: error.message || String(error),
        stack: error.stack,
        context: context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert web developer analyzing JavaScript/TypeScript errors in a React application with Supabase backend. Provide concise analysis with reasoning, severity assessment, and suggested fixes.'
            },
            {
              role: 'user',
              content: `Analyze this error and provide insights:
              
              Error: ${errorInfo.message}
              Stack: ${errorInfo.stack}
              Context: ${JSON.stringify(errorInfo.context, null, 2)}
              URL: ${errorInfo.url}
              
              Please provide:
              1. Reasoning for why this error occurred
              2. Severity level (low/medium/high/critical)
              3. Suggested fix
              4. Error category`
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;

      return this.parseAnalysis(analysis);
    } catch (apiError) {
      console.error('DeepSeek analysis failed:', apiError);
      return {
        reasoning: 'Failed to analyze error with DeepSeek API',
        severity: 'medium',
        suggestedFix: 'Check error manually and refer to documentation',
        category: 'Unknown'
      };
    }
  }

  private parseAnalysis(analysis: string): DeepSeekAnalysis {
    const lines = analysis.split('\n');
    
    let reasoning = 'Error analysis not available';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let suggestedFix = 'No specific fix suggested';
    let category = 'General';

    lines.forEach(line => {
      if (line.toLowerCase().includes('reasoning') || line.includes('1.')) {
        reasoning = line.replace(/^.*?reasoning:?\s*/i, '').replace(/^1\.\s*/, '');
      }
      if (line.toLowerCase().includes('severity') || line.includes('2.')) {
        const severityMatch = line.match(/(low|medium|high|critical)/i);
        if (severityMatch) {
          severity = severityMatch[1].toLowerCase() as any;
        }
      }
      if (line.toLowerCase().includes('fix') || line.includes('3.')) {
        suggestedFix = line.replace(/^.*?fix:?\s*/i, '').replace(/^3\.\s*/, '');
      }
      if (line.toLowerCase().includes('category') || line.includes('4.')) {
        category = line.replace(/^.*?category:?\s*/i, '').replace(/^4\.\s*/, '');
      }
    });

    return { reasoning, severity, suggestedFix, category };
  }

  logError(error: any, context?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message || String(error),
      context,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      category: 'system'
    };

    this.logs.push(logEntry);
    console.error('Error logged:', logEntry);

    this.analyzeError(error, context).then(analysis => {
      console.log('DeepSeek Analysis:', analysis);
    });
  }

  logApiCall(method: string, endpoint: string, payload?: any, response?: any, error?: any, duration?: number): void {
    this.apiMetrics.totalCalls++;
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: error ? 'error' : 'info',
      message: `${method} ${endpoint}`,
      context: {
        method,
        endpoint,
        payload: payload ? this.sanitizePayload(payload) : undefined,
        response: response ? this.sanitizeResponse(response) : undefined,
        error: error?.message,
        status: response?.status || (error ? 'error' : 'success')
      },
      url: window.location.href,
      category: 'api',
      operation: 'api_call',
      duration
    };

    this.logs.push(logEntry);
    
    if (error) {
      this.analyzeError(error, { apiCall: { method, endpoint, payload } });
    }
  }

  logDatabaseOperation(operation: string, table: string, data?: any, result?: any, error?: any, duration?: number): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: error ? 'error' : 'info',
      message: `${operation.toUpperCase()} ${table}`,
      context: {
        operation,
        table,
        data: data ? this.sanitizePayload(data) : undefined,
        result: result ? this.sanitizeResponse(result) : undefined,
        error: error?.message,
        recordCount: Array.isArray(result?.data) ? result.data.length : undefined
      },
      url: window.location.href,
      category: 'database',
      operation: 'db_operation',
      duration
    };

    this.logs.push(logEntry);
    console.log('Database operation logged:', logEntry);
  }

  logPageVisit(path: string): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Page visit: ${path}`,
      context: { path, referrer: document.referrer },
      url: window.location.href,
      userAgent: navigator.userAgent,
      category: 'ui',
      operation: 'page_visit'
    };

    this.logs.push(logEntry);
  }

  logUserAction(action: string, target: string, data?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `User action: ${action} on ${target}`,
      context: { action, target, data },
      url: window.location.href,
      category: 'ui',
      operation: 'user_action'
    };

    this.logs.push(logEntry);
  }

  private sanitizePayload(payload: any): any {
    if (!payload) return undefined;
    
    // Remove sensitive information
    const sanitized = JSON.parse(JSON.stringify(payload));
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.pin) sanitized.pin = '[REDACTED]';
    if (sanitized.token) sanitized.token = '[REDACTED]';
    
    return sanitized;
  }

  private sanitizeResponse(response: any): any {
    if (!response) return undefined;
    
    const sanitized = JSON.parse(JSON.stringify(response));
    if (sanitized.session_token) sanitized.session_token = '[REDACTED]';
    
    return sanitized;
  }

  getLogs(filter?: { 
    level?: string; 
    category?: string; 
    since?: Date; 
    limit?: number 
  }): LogEntry[] {
    let filteredLogs = [...this.logs];
    
    if (filter?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }
    
    if (filter?.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filter.category);
    }
    
    if (filter?.since) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= filter.since!
      );
    }
    
    if (filter?.limit) {
      filteredLogs = filteredLogs.slice(-filter.limit);
    }
    
    return filteredLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getApiMetrics(): ApiCallMetrics {
    return { ...this.apiMetrics };
  }

  clearLogs(): void {
    this.logs = [];
    this.apiMetrics = {
      totalCalls: 0,
      callsPerMinute: 0,
      lastMinuteCalls: [],
      errorRate: 0,
      averageResponseTime: 0
    };
  }

  exportLogs(): string {
    return JSON.stringify({
      logs: this.logs,
      metrics: this.apiMetrics,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
}

export const deepSeekService = new DeepSeekService();
