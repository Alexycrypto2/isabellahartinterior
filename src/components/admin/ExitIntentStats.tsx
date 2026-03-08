import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MousePointerClick, TrendingUp } from 'lucide-react';

export default function ExitIntentStats() {
  const { data: stats } = useQuery({
    queryKey: ['exit-intent-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: shown, error: shownError } = await supabase
        .from('analytics_events')
        .select('id', { count: 'exact' })
        .eq('event_type', 'exit_intent_shown')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { data: converted, error: convertedError } = await supabase
        .from('analytics_events')
        .select('id', { count: 'exact' })
        .eq('event_type', 'exit_intent_converted')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (shownError || convertedError) throw shownError || convertedError;

      const shownCount = shown?.length || 0;
      const convertedCount = converted?.length || 0;
      const conversionRate = shownCount > 0 ? ((convertedCount / shownCount) * 100).toFixed(1) : '0';

      return { shownCount, convertedCount, conversionRate };
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
      <CardContent>
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
        <p className="text-xs text-muted-foreground text-center mt-3">Last 30 days</p>
      </CardContent>
    </Card>
  );
}
