import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSetting } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MousePointerClick, TrendingUp, FlaskConical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VariantStats {
  id: string;
  name: string;
  shown: number;
  converted: number;
  rate: string;
}

export default function ExitIntentStats() {
  const { data: popupSettings } = useSiteSetting('exit_intent_popup');
  const settings = (popupSettings?.value || {}) as Record<string, any>;
  const abEnabled = settings.ab_enabled ?? false;
  const variants = (settings.variants || []) as Array<{ id: string; name: string }>;

  const { data: stats } = useQuery({
    queryKey: ['exit-intent-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: shown, error: shownError } = await supabase
        .from('analytics_events')
        .select('id, entity_id')
        .eq('event_type', 'exit_intent_shown')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { data: converted, error: convertedError } = await supabase
        .from('analytics_events')
        .select('id, entity_id')
        .eq('event_type', 'exit_intent_converted')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (shownError || convertedError) throw shownError || convertedError;

      const shownCount = shown?.length || 0;
      const convertedCount = converted?.length || 0;
      const conversionRate = shownCount > 0 ? ((convertedCount / shownCount) * 100).toFixed(1) : '0';

      // Build per-variant stats
      const allVariantIds = ['control', ...variants.map(v => v.id)];
      const variantStats: VariantStats[] = allVariantIds.map(vid => {
        const vShown = (shown || []).filter(e => (e.entity_id || 'control') === vid).length;
        const vConverted = (converted || []).filter(e => (e.entity_id || 'control') === vid).length;
        const name = vid === 'control' ? 'Control (A)' : variants.find(v => v.id === vid)?.name || vid;
        return {
          id: vid,
          name,
          shown: vShown,
          converted: vConverted,
          rate: vShown > 0 ? ((vConverted / vShown) * 100).toFixed(1) : '0',
        };
      });

      return { shownCount, convertedCount, conversionRate, variantStats };
    },
  });

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MousePointerClick className="h-5 w-5 text-purple-500" />
          Exit Intent Popup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats?.shownCount || 0}</div>
            <div className="text-xs text-muted-foreground">Shown</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats?.convertedCount || 0}</div>
            <div className="text-xs text-muted-foreground">Converted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {stats?.conversionRate || 0}%
            </div>
            <div className="text-xs text-muted-foreground">Rate</div>
          </div>
        </div>

        {abEnabled && stats?.variantStats && stats.variantStats.some(v => v.shown > 0) && (
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <FlaskConical className="h-3.5 w-3.5" />
              A/B Test Results
            </div>
            <div className="space-y-1.5">
              {stats.variantStats
                .filter(v => v.shown > 0)
                .sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate))
                .map((v, idx) => (
                  <div key={v.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-background/50">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{v.name}</span>
                      {idx === 0 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Best</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{v.shown} shown</span>
                      <span>{v.converted} conv.</span>
                      <span className="font-bold text-foreground">{v.rate}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">Last 30 days</p>
      </CardContent>
    </Card>
  );
}
