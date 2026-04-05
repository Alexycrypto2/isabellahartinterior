import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Copy, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorEntry {
  id: string;
  message: string;
  source: string;
  timestamp: string;
  suggestion?: string;
}

const DevErrorLog = () => {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);

  useEffect(() => {
    // Capture global errors
    const handler = (event: ErrorEvent) => {
      setErrors(prev => [{
        id: crypto.randomUUID(),
        message: event.message,
        source: `${event.filename}:${event.lineno}:${event.colno}`,
        timestamp: new Date().toISOString(),
        suggestion: getSuggestion(event.message),
      }, ...prev].slice(0, 100));
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || String(event.reason);
      setErrors(prev => [{
        id: crypto.randomUUID(),
        message: msg,
        source: 'Unhandled Promise Rejection',
        timestamp: new Date().toISOString(),
        suggestion: getSuggestion(msg),
      }, ...prev].slice(0, 100));
    };

    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', rejectionHandler);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  const getSuggestion = (msg: string): string => {
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch'))
      return 'Check network connectivity and verify the API endpoint is correct and reachable.';
    if (msg.includes('401') || msg.includes('Unauthorized'))
      return 'API key may be invalid or expired. Check your API key configuration in Settings.';
    if (msg.includes('429') || msg.includes('rate limit'))
      return 'You\'re hitting rate limits. Wait a few minutes before retrying.';
    if (msg.includes('CORS'))
      return 'CORS error — ensure your edge function includes proper CORS headers.';
    if (msg.includes('undefined') || msg.includes('null'))
      return 'A variable is undefined. Check that data is loaded before accessing it.';
    if (msg.includes('JSON'))
      return 'Invalid JSON response. Check the API response format.';
    return 'Review the error message and check your code for the referenced file/line.';
  };

  const copyError = (error: ErrorEntry) => {
    const text = `Error: ${error.message}\nSource: ${error.source}\nTime: ${error.timestamp}\nSuggestion: ${error.suggestion || 'N/A'}`;
    navigator.clipboard.writeText(text);
    toast.success('Error details copied');
  };

  const clearErrors = () => {
    setErrors([]);
    toast.success('Error log cleared');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Error Log</CardTitle>
            <CardDescription>Runtime errors captured from the site with AI-powered suggestions</CardDescription>
          </div>
          {errors.length > 0 && (
            <Button onClick={clearErrors} size="sm" variant="outline" className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {errors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No errors captured yet</p>
            <p className="text-xs mt-1">Errors will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-auto">
            {errors.map((error) => (
              <div key={error.id} className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-medium text-destructive truncate">{error.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="truncate">{error.source}</span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Clock className="h-3 w-3" />
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => copyError(error)} className="shrink-0">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {error.suggestion && (
                  <div className="text-xs bg-accent/10 text-accent-foreground/80 rounded-lg p-2">
                    <span className="font-semibold">💡 Suggestion:</span> {error.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DevErrorLog;
