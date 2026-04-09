import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceStatus {
  name: string;
  description: string;
  status: 'checking' | 'operational' | 'down' | 'unknown';
  lastChecked: string | null;
  error?: string;
  functionName: string;
}

const SERVICES: Omit<ServiceStatus, 'status' | 'lastChecked' | 'error'>[] = [
  { name: 'Chatbot', description: 'AI home decor assistant', functionName: 'home-decor-chat' },
  { name: 'Trending Products', description: 'Product discovery engine', functionName: 'discover-trending-products' },
  { name: 'Blog Writer', description: 'AI blog post generator', functionName: 'generate-blog-post' },
  { name: 'Pin Generator', description: 'Pinterest description generator', functionName: 'generate-pin-description' },
  { name: 'Product Import', description: 'Blog product discovery', functionName: 'discover-blog-products' },
  { name: 'Email System', description: 'Contact email sender', functionName: 'send-contact-email' },
];

const DevHealthMonitor = () => {
  const [services, setServices] = useState<ServiceStatus[]>(
    SERVICES.map(s => ({ ...s, status: 'unknown', lastChecked: null }))
  );
  const [isChecking, setIsChecking] = useState(false);

  const checkService = async (service: Omit<ServiceStatus, 'status' | 'lastChecked' | 'error'>): Promise<ServiceStatus> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${service.functionName}`;
      
      // Use POST with empty/minimal body - edge functions respond to POST
      // A non-200 response like 400 still means the function is reachable and operational
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ healthCheck: true }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      // Any response (even 400/422) means the function is deployed and reachable
      // Only 502/503/504 or network errors mean it's truly down
      const isUp = response.status < 500;

      return {
        ...service,
        status: isUp ? 'operational' : 'down',
        lastChecked: new Date().toISOString(),
        error: isUp ? undefined : `HTTP ${response.status}`,
      };
    } catch (err: any) {
      return {
        ...service,
        status: 'down',
        lastChecked: new Date().toISOString(),
        error: err.name === 'AbortError' ? 'Timeout (10s)' : 'Failed to connect',
      };
    }
  };

  const runHealthCheck = async () => {
    setIsChecking(true);
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' as const })));

    const results = await Promise.all(SERVICES.map(checkService));
    setServices(results);
    setIsChecking(false);

    const downCount = results.filter(r => r.status === 'down').length;
    if (downCount > 0) {
      toast.error(`${downCount} service(s) are down`);
    } else {
      toast.success('All services operational ✓');
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const operationalCount = services.filter(s => s.status === 'operational').length;
  const downCount = services.filter(s => s.status === 'down').length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Site Health Monitor</CardTitle>
              <CardDescription>Real-time status of all AI features and services</CardDescription>
            </div>
            <Button onClick={runHealthCheck} disabled={isChecking} size="sm" variant="outline" className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Check All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4 text-sm">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium">{operationalCount}</span> Operational
            </span>
            <span className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="font-medium">{downCount}</span> Down
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.name}
                className={`p-3 rounded-xl border transition-colors ${
                  service.status === 'operational' ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20' :
                  service.status === 'down' ? 'border-destructive/30 bg-destructive/5' :
                  service.status === 'checking' ? 'border-border bg-muted/30 animate-pulse' :
                  'border-border bg-muted/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                  {service.status === 'operational' && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                  {service.status === 'down' && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                  {service.status === 'checking' && <Clock className="h-5 w-5 text-muted-foreground animate-spin shrink-0" />}
                  {service.status === 'unknown' && <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />}
                </div>
                {service.error && (
                  <p className="text-xs text-destructive mt-2 font-mono bg-destructive/10 rounded px-2 py-1">{service.error}</p>
                )}
                {service.lastChecked && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Checked {new Date(service.lastChecked).toLocaleTimeString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevHealthMonitor;
