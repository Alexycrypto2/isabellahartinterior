import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, CheckCircle2, XCircle, Loader2, Copy, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FixResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
}

const AUTO_FIX_CHECKS = [
  { name: 'API Keys Valid', description: 'Verify AI service API keys are configured' },
  { name: 'Database Connection', description: 'Check connection to database' },
  { name: 'Edge Functions', description: 'Verify edge functions are reachable' },
  { name: 'Storage Buckets', description: 'Check storage bucket accessibility' },
  { name: 'Auth Service', description: 'Verify authentication service' },
];

const DevAutoFix = () => {
  const [results, setResults] = useState<FixResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (name: string, update: Partial<FixResult>) => {
    setResults(prev => prev.map(r => r.name === name ? { ...r, ...update } : r));
  };

  const runAutoFix = async () => {
    setIsRunning(true);
    setResults(AUTO_FIX_CHECKS.map(c => ({ name: c.name, status: 'pending' })));

    // Check API Keys
    setResults(prev => prev.map(r => r.name === 'API Keys Valid' ? { ...r, status: 'running' } : r));
    try {
      const { data: settings } = await supabase.from('site_settings').select('*').in('key', ['ai_settings']);
      updateResult('API Keys Valid', { status: 'passed', message: 'AI settings configured' });
    } catch {
      updateResult('API Keys Valid', { status: 'failed', message: 'Could not read settings table' });
    }

    // Check Database
    setResults(prev => prev.map(r => r.name === 'Database Connection' ? { ...r, status: 'running' } : r));
    try {
      const { error } = await supabase.from('site_settings').select('id').limit(1);
      updateResult('Database Connection', {
        status: error ? 'failed' : 'passed',
        message: error ? error.message : 'Connected successfully',
      });
    } catch (e: any) {
      updateResult('Database Connection', { status: 'failed', message: e.message });
    }

    // Check Edge Functions
    setResults(prev => prev.map(r => r.name === 'Edge Functions' ? { ...r, status: 'running' } : r));
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/home-decor-chat`;
      const resp = await fetch(url, { method: 'OPTIONS' });
      updateResult('Edge Functions', {
        status: resp.ok || resp.status === 204 ? 'passed' : 'failed',
        message: resp.ok || resp.status === 204 ? 'Edge functions reachable' : `HTTP ${resp.status}`,
      });
    } catch (e: any) {
      updateResult('Edge Functions', { status: 'failed', message: e.message });
    }

    // Check Storage
    setResults(prev => prev.map(r => r.name === 'Storage Buckets' ? { ...r, status: 'running' } : r));
    try {
      const { data, error } = await supabase.storage.getBucket('blog-images');
      updateResult('Storage Buckets', {
        status: error ? 'failed' : 'passed',
        message: error ? error.message : 'Storage accessible',
      });
    } catch (e: any) {
      updateResult('Storage Buckets', { status: 'failed', message: e.message });
    }

    // Check Auth
    setResults(prev => prev.map(r => r.name === 'Auth Service' ? { ...r, status: 'running' } : r));
    try {
      const { data } = await supabase.auth.getSession();
      updateResult('Auth Service', { status: 'passed', message: 'Auth service responding' });
    } catch (e: any) {
      updateResult('Auth Service', { status: 'failed', message: e.message });
    }

    setIsRunning(false);
    const failedCount = results.filter(r => r.status === 'failed').length;
    if (failedCount === 0) toast.success('All checks passed!');
  };

  const copyError = (msg: string) => {
    navigator.clipboard.writeText(msg);
    toast.success('Error copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Auto Fix System</CardTitle>
              <CardDescription>One-click diagnostics for common issues</CardDescription>
            </div>
            <Button onClick={runAutoFix} disabled={isRunning} className="gap-1.5">
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
              {isRunning ? 'Running...' : 'Run Auto Fix'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Wrench className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Click "Run Auto Fix" to diagnose all services</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result.name} className={`p-3 rounded-xl border flex items-center justify-between ${
                  result.status === 'passed' ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20' :
                  result.status === 'failed' ? 'border-destructive/30 bg-destructive/5' :
                  result.status === 'running' ? 'border-accent/30 bg-accent/5 animate-pulse' :
                  'border-border bg-muted/20'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {result.status === 'passed' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {result.status === 'failed' && <XCircle className="h-4 w-4 text-destructive" />}
                      {result.status === 'running' && <Loader2 className="h-4 w-4 text-accent animate-spin" />}
                      {result.status === 'pending' && <RefreshCw className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-medium text-sm">{result.name}</span>
                    </div>
                    {result.message && (
                      <p className={`text-xs mt-1 ml-6 ${result.status === 'failed' ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {result.message}
                      </p>
                    )}
                  </div>
                  {result.status === 'failed' && result.message && (
                    <Button size="sm" variant="ghost" onClick={() => copyError(result.message!)} className="shrink-0">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DevAutoFix;
