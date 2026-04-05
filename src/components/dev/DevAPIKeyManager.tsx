import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, Eye, EyeOff, CheckCircle2, XCircle, Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSiteSettings, useUpsertSiteSetting } from '@/hooks/useSiteSettings';

interface APIKeyConfig {
  id: string;
  label: string;
  settingsKey: string;
  field: string;
  placeholder: string;
}

const API_KEYS: APIKeyConfig[] = [
  { id: 'gemini', label: 'Gemini AI', settingsKey: 'ai_settings', field: 'text_api_key', placeholder: 'AIza...' },
  { id: 'amazon', label: 'Amazon Associates', settingsKey: 'ai_settings', field: 'amazon_tag', placeholder: 'your-tag-20' },
  { id: 'pinterest', label: 'Pinterest API', settingsKey: 'ai_settings', field: 'pinterest_key', placeholder: 'Pinterest API Key' },
];

const DevAPIKeyManager = () => {
  const { data: settings } = useSiteSettings();
  const upsertSetting = useUpsertSiteSetting();
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, 'valid' | 'invalid' | null>>({});

  useEffect(() => {
    if (settings) {
      const aiSettings = settings.find((s: any) => s.key === 'ai_settings');
      if (aiSettings?.value) {
        const vals: Record<string, string> = {};
        API_KEYS.forEach(k => {
          vals[k.id] = (aiSettings.value as any)?.[k.field] || '';
        });
        setKeyValues(vals);
      }
    }
  }, [settings]);

  const toggleVisible = (id: string) => {
    setVisible(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const testKey = async (config: APIKeyConfig) => {
    const key = keyValues[config.id];
    if (!key) {
      toast.error('No key to test');
      return;
    }
    setTesting(prev => ({ ...prev, [config.id]: true }));
    
    try {
      if (config.id === 'gemini') {
        const { data, error } = await supabase.functions.invoke('test-ai-key', {
          body: { type: 'text', provider: 'google', api_key: key, model: 'gemini-2.0-flash' }
        });
        setTestResults(prev => ({ ...prev, [config.id]: error ? 'invalid' : data?.success ? 'valid' : 'invalid' }));
      } else {
        // For non-testable keys, just check they're non-empty
        setTestResults(prev => ({ ...prev, [config.id]: key.length > 3 ? 'valid' : 'invalid' }));
      }
    } catch {
      setTestResults(prev => ({ ...prev, [config.id]: 'invalid' }));
    } finally {
      setTesting(prev => ({ ...prev, [config.id]: false }));
    }
  };

  const saveKey = async (config: APIKeyConfig) => {
    const aiSettings = settings?.find((s: any) => s.key === 'ai_settings');
    const existing = (aiSettings?.value as any) || {};
    const updated = { ...existing, [config.field]: keyValues[config.id] };
    
    upsertSetting.mutate(
      { key: 'ai_settings', value: updated },
      {
        onSuccess: () => toast.success(`${config.label} key saved`),
        onError: () => toast.error('Failed to save'),
      }
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">API Key Manager</CardTitle>
        <CardDescription>Manage, test, and monitor all API keys in one place</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {API_KEYS.map((config) => (
          <div key={config.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-accent" />
                <Label className="font-medium">{config.label}</Label>
              </div>
              {testResults[config.id] === 'valid' && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" />Valid</Badge>}
              {testResults[config.id] === 'invalid' && <Badge variant="destructive" className="text-[10px]"><XCircle className="h-3 w-3 mr-1" />Invalid</Badge>}
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={visible[config.id] ? 'text' : 'password'}
                  value={keyValues[config.id] || ''}
                  onChange={(e) => setKeyValues(prev => ({ ...prev, [config.id]: e.target.value }))}
                  placeholder={config.placeholder}
                  className="pr-10 font-mono text-xs"
                />
                <button
                  onClick={() => toggleVisible(config.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {visible[config.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button size="sm" variant="outline" onClick={() => testKey(config)} disabled={testing[config.id]}>
                {testing[config.id] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Test'}
              </Button>
              <Button size="sm" onClick={() => saveKey(config)}>
                <Save className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        <div className="p-3 rounded-xl bg-accent/10 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">💡 Built-in AI Credits</p>
          <p>Your site uses Lovable AI credits by default. Custom API keys are optional fallbacks.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevAPIKeyManager;
