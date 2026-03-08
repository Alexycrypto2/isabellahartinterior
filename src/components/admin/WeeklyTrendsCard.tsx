import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, RefreshCw, Loader2, Sparkles, PenSquare, CheckCircle2, ExternalLink } from 'lucide-react';

interface Trend {
  rank: number;
  trend: string;
  description: string;
  suggested_title?: string;
  keywords?: string[];
}

const WeeklyTrendsCard = () => {
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();
  const { toast } = useToast();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [week, setWeek] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch all blog posts to check which trends have been published
  const { data: blogPosts } = useQuery({
    queryKey: ['blog-posts-for-trends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, published')
        .eq('published', true);
      if (error) throw error;
      return data;
    },
  });

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

  // Check if a trend has already been published as a blog post
  const getPublishedPost = (trend: Trend) => {
    if (!blogPosts) return null;
    
    // Match by checking if the suggested title or trend name appears in any published post title
    const trendWords = trend.suggested_title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const trendKeywords = trend.keywords.map(k => k.toLowerCase());
    
    for (const post of blogPosts) {
      const postTitle = post.title.toLowerCase();
      
      // Check if multiple keywords match
      const keywordMatches = trendKeywords.filter(k => postTitle.includes(k)).length;
      const wordMatches = trendWords.filter(w => postTitle.includes(w)).length;
      
      // Consider it a match if at least 2 keywords match OR 3+ significant words match
      if (keywordMatches >= 2 || wordMatches >= 3) {
        return post;
      }
    }
    return null;
  };

  // Navigate to blog editor with pre-filled AI writer data
  const handleWriteBlogPost = (trend: Trend) => {
    const params = new URLSearchParams({
      autoOpenAi: 'true',
      topic: trend.suggested_title,
      keywords: trend.keywords.join(', '),
      trendRank: trend.rank.toString(),
    });
    
    navigate(`/admin/blog/new?${params.toString()}`);
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
              {trends.slice(0, 10).map((trend) => {
                const publishedPost = getPublishedPost(trend);
                
                return (
                  <div
                    key={trend.rank}
                    className={`p-3 rounded-xl bg-background/80 border transition-colors ${
                      publishedPost 
                        ? 'border-emerald-500/30 bg-emerald-500/5' 
                        : 'border-border/50 hover:border-accent/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        publishedPost ? 'bg-emerald-500/20' : 'bg-accent/10'
                      }`}>
                        {publishedPost ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <span className="text-xs font-bold text-accent">{trend.rank}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold line-clamp-1">{trend.trend}</p>
                          {publishedPost && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-1.5 py-0 shrink-0">
                              Published
                            </Badge>
                          )}
                        </div>
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
                        
                        {/* Action Button */}
                        <div className="mt-3">
                          {publishedPost ? (
                            <a
                              href={`/blog/${publishedPost.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Published Post
                            </a>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleWriteBlogPost(trend)}
                              className="h-7 text-xs px-3 rounded-full bg-accent text-accent-foreground hover:brightness-110"
                            >
                              <PenSquare className="h-3 w-3 mr-1.5" />
                              Write Blog Post
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
