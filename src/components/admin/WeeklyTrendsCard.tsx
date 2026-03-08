import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, RefreshCw, Loader2, Sparkles } from 'lucide-react';

interface Trend {
  rank: number;
  trend: string;
  description: string;
  suggested_title: string;
  keywords: string[];
}

const WeeklyTrendsCard = () => {
  const { data: settings } = useSiteSettings();
  const { toast } = useToast();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [week, setWeek] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (settings) {
      const trendSetting = settings.find(s => s.key === 'weekly_trends');
      if (trendSetting?.value) {
        const val = trendSetting.value as any;
        setTrends(val.trends || []);
        setWeek(val.week || '');
        setGeneratedAt(val.generated_at || '');
      }
    }
  }, [settings]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('weekly-trend-report');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setTrends(data.trends || []);
      setWeek(data.week || '');
      setGeneratedAt(new Date().toISOString());
      toast({ title: 'Trend report generated!', description: '10 trending topics have been identified for this week.' });
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-accent/5 via-transparent to-accent/5">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md">
                <TrendingUp className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">This Week's Trends</CardTitle>
                {generatedAt && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {week} · Updated {new Date(generatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-full text-xs h-8 px-3 border-border/50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1.5 h-3 w-3" />
                  Generate Now
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {trends.length > 0 ? (
            <div className="space-y-2.5 mt-3">
              {trends.slice(0, 10).map((trend) => (
                <div
                  key={trend.rank}
                  className="p-3 rounded-xl bg-background/80 border border-border/50 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-accent">{trend.rank}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold line-clamp-1">{trend.trend}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{trend.description}</p>
                      <div className="mt-2 p-2 bg-muted/40 rounded-lg border-l-2 border-accent/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Suggested Title</p>
                        <p className="text-xs font-medium mt-0.5 line-clamp-1">{trend.suggested_title}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {trend.keywords.map((kw) => (
                          <Badge key={kw} variant="secondary" className="text-[10px] bg-accent/5 text-accent border-accent/20 px-1.5 py-0">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-5 w-5 opacity-30" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">No trend report yet</p>
              <p className="text-xs text-muted-foreground mb-4">Generate your first weekly trend report</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="rounded-full text-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3 w-3" />
                    Generate Trend Report
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default WeeklyTrendsCard;
