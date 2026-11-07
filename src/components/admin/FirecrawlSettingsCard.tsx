import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, Eye, EyeOff } from 'lucide-react';
import { useSiteSettings, useUpsertSiteSetting } from '@/hooks/useSiteSettings';
import { useToast } from '@/hooks/use-toast';

export default function FirecrawlSettingsCard() {
  const { data: settings } = useSiteSettings();
  const upsert = useUpsertSiteSetting();
  const { toast } = useToast();
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const s = (settings as any[] | undefined)?.find((x) => x.key === 'firecrawl');
    if (s?.value?.api_key) setKey(s.value.api_key);
  }, [settings]);

  const save = async () => {
    try {
      await upsert.mutateAsync({ key: 'firecrawl', value: { api_key: key.trim() } } as any);
      toast({ title: 'Saved', description: 'Firecrawl key saved. Amazon auto-fill will use it.' });
    } catch {
      toast({ title: 'Error', description: 'Could not save Firecrawl key.', variant: 'destructive' });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Firecrawl (Amazon Auto-Fill)</CardTitle>
        <CardDescription>Paste your Firecrawl API key (starts with fc-) so Amazon links auto-fill title, price, image and rating.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label htmlFor="firecrawl-key">API Key</Label>
        <div className="flex gap-2">
          <Input id="firecrawl-key" type={show ? 'text' : 'password'} value={key} onChange={(e) => setKey(e.target.value)} placeholder="fc-..." />
          <Button type="button" variant="ghost" size="sm" onClick={() => setShow((v) => !v)}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button type="button" size="sm" onClick={save} disabled={upsert.isPending}>
            <Save className="h-4 w-4 mr-1" />Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
