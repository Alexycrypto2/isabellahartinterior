import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Loader2, Sparkles, PenSquare, CheckCircle2, ExternalLink, Search, CalendarClock, ShoppingBag } from 'lucide-react';
import { FORMAT_LABELS } from '@/lib/blogFormats';

export interface ProductSeed { name: string; price_range?: string; why?: string; search_query?: string }

interface Trend {
  rank: number;
  trend: string;
  description: string;
  why_trending?: string;
  suggested_title?: string;
  pinterest_title?: string;
  format?: string;
  category?: string;
  room?: string;
  style?: string;
  section?: string;
  keywords?: string[];
  pinterest_score?: number;
  google_score?: number;
  affiliate_score?: number;
  overall_score?: number;
  competition?: string;
  season_peak?: string;
  publish_by?: string;
  product_seeds?: ProductSeed[];
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'idea-roundup', label: '📌 Ideas' },
  { value: 'product-roundup', label: '💰 Products' },
  { value: 'room-guide', label: '🛋️ Rooms' },
  { value: 'seasonal', label: '🎄 Seasonal' },
  { value: 'buying-guide', label: '📐 Buying' },
  { value: 'comparison', label: '⚖️ X vs Y' },
  { value: 'gift-guide', label: '🎁 Gifts' },
  { value: 'diy', label: '🔨 DIY' },
];

const Score = ({ label, v }: { label: string; v?: number }) =>
  typeof v === 'number' ? (
    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
      {label} <b className="text-foreground">{v}</b>
    </span>
  ) : null;

const WeeklyTrendsCard = () => {
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();
  const { toast } = useToast();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [week, setWeek] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState('all');

  const { data: blogPosts } = useQuery({
    queryKey: ['blog-posts-for-trends'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blog_posts').select('id, title, slug, published').eq('published', true);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const s = settings?.find((x) => x.key === 'weekly_trends');
    if (s?.value) {
      const val = s.value as any;
      setTrends(val.trends || []);
      setWeek(val.week || '');
      setGeneratedAt(val.generated_at || '');
    }
  }, [settings]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('weekly-trend-report', { body: { focus: filter } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTrends(data.trends || []);
      setWeek(data.week || '');
      setGeneratedAt(new Date().toISOString());
      toast({ title: 'Deep trend scan complete', description: `${data.trends?.length || 0} scored blog opportunities found.` });
    } catch (err: any) {
      toast({ title: 'Scan failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const getPublishedPost = (trend: Trend) => {
    if (!blogPosts) return null;
    const words = (trend.suggested_title || trend.trend || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const kws = (trend.keywords || []).map((k) => String(k).toLowerCase());
    return blogPosts.find((p) => {
      const t = p.title.toLowerCase();
      return kws.filter((k) => t.includes(k)).length >= 2 || words.filter((w) => t.includes(w)).length >= 3;
    }) || null;
  };

  const handleWrite = (trend: Trend) => {
    sessionStorage.setItem('ai_writer_prefill', JSON.stringify({
      topic: trend.suggested_title || trend.trend,
      keywords: (trend.keywords || []).join(', '),
      format: trend.format || 'auto',
      category: trend.category || '',
      room: trend.room || '',
      style: trend.style || '',
      section: trend.section || '',
      pinterest_title: trend.pinterest_title || '',
      product_seeds: trend.product_seeds || [],
    }));
    navigate(`/admin/blog/new?autoOpenAi=true&prefill=1`);
  };

  const shown = trends.filter((t) => filter === 'all' || t.format === filter);

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md">
              <TrendingUp className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Blog Topic Researcher</CardTitle>
              {generatedAt && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{week} · Updated {new Date(generatedAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <Button size="sm" onClick={handleGenerate} disabled={isGenerating} className="rounded-full text-xs h-8 px-3">
            {isGenerating ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Researching…</> : <><Search className="mr-1.5 h-3 w-3" />Deep Scan</>}
          </Button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pt-3 -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border ${filter === f.value ? 'bg-accent text-accent-foreground border-accent' : 'border-border/50 text-muted-foreground'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground pt-1">Pick a format, then Deep Scan to focus the research on it.</p>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {shown.length > 0 ? (
          <div className="space-y-3 mt-2">
            {shown.map((trend) => {
              const published = getPublishedPost(trend);
              return (
                <div key={trend.rank + trend.trend} className={`p-3 rounded-xl border ${published ? 'border-accent/40 bg-accent/5' : 'border-border/50 bg-background/80'}`}>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-accent/10 flex flex-col items-center justify-center shrink-0">
                      {published ? <CheckCircle2 className="h-4 w-4 text-accent" /> : (
                        <span className="text-xs font-bold text-accent">{trend.overall_score ?? trend.rank}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {trend.format && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{FORMAT_LABELS[trend.format] || trend.format}</Badge>}
                        {trend.competition && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Competition: {trend.competition}</Badge>}
                        {published && <Badge className="text-[10px] px-1.5 py-0">Published</Badge>}
                      </div>
                      <p className="text-sm font-semibold">{trend.suggested_title || trend.trend}</p>
                      {trend.pinterest_title && <p className="text-[11px] text-muted-foreground">📌 {trend.pinterest_title}</p>}
                      <p className="text-xs text-muted-foreground">{trend.why_trending || trend.description}</p>
                      <div className="flex gap-1 flex-wrap">
                        <Score label="Pinterest" v={trend.pinterest_score} />
                        <Score label="Google" v={trend.google_score} />
                        <Score label="Affiliate" v={trend.affiliate_score} />
                      </div>
                      {trend.publish_by && (
                        <p className="text-[11px] flex items-center gap-1 text-accent"><CalendarClock className="h-3 w-3" />Publish by {trend.publish_by} · peak {trend.season_peak}</p>
                      )}
                      {trend.product_seeds && trend.product_seeds.length > 0 && (
                        <div className="rounded-lg bg-muted/40 p-2 space-y-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><ShoppingBag className="h-3 w-3" />Suggested products</p>
                          {trend.product_seeds.slice(0, 8).map((p, i) => (
                            <a key={i} href={`https://www.amazon.com/s?k=${encodeURIComponent(p.search_query || p.name)}&tag=roomrefine-20`} target="_blank" rel="nofollow noopener noreferrer" className="flex justify-between gap-2 text-[11px] hover:text-accent">
                              <span className="line-clamp-1">{p.name}</span>
                              <span className="shrink-0 text-muted-foreground">{p.price_range}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1 flex-wrap">
                        {(trend.keywords || []).slice(0, 5).map((k) => (
                          <Badge key={k} variant="outline" className="text-[10px] px-1.5 py-0 border-accent/30 text-accent">{k}</Badge>
                        ))}
                      </div>
                      {published ? (
                        <Button size="sm" variant="outline" className="h-7 text-xs rounded-full" onClick={() => window.open(`/blog/${published.slug}`, '_blank')}>
                          <ExternalLink className="mr-1 h-3 w-3" />View post
                        </Button>
                      ) : (
                        <Button size="sm" className="h-7 text-xs rounded-full" onClick={() => handleWrite(trend)}>
                          <PenSquare className="mr-1 h-3 w-3" />Write this post
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Sparkles className="h-5 w-5 opacity-30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{trends.length ? 'No ideas in this format yet — run a Deep Scan.' : 'No research yet'}</p>
            <Button size="sm" onClick={handleGenerate} disabled={isGenerating} className="rounded-full text-xs">
              {isGenerating ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Search className="mr-1.5 h-3 w-3" />}Deep Scan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyTrendsCard;
