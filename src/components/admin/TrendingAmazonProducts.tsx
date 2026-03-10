import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, Sparkles, ShoppingBag, ExternalLink, Plus, RefreshCw, Flame, Pin,
} from 'lucide-react';

interface TrendingProduct {
  rank: number;
  product_name: string;
  price_range: string;
  trending_reason: string;
  pinterest_title: string;
  category: string;
  search_query: string;
}

const TrendingAmazonProducts = () => {
  const { data: settings } = useSiteSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [week, setWeek] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!settings) return;
    const trending = settings.find((s: any) => s.key === 'trending_amazon_products');
    if (trending?.value) {
      const val = trending.value as any;
      setProducts(val.products || []);
      setWeek(val.week || '');
      setGeneratedAt(val.generated_at || '');
    }
  }, [settings]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('discover-trending-products');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setProducts(data.products || []);
      setWeek(data.week || '');
      setGeneratedAt(new Date().toISOString());
      toast({ title: '✨ Trending Products Updated', description: `Found ${data.products?.length || 0} trending products.` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to fetch trending products', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToShop = (product: TrendingProduct) => {
    const slug = product.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(product.search_query)}&tag=roomrefine-20`;
    navigate('/admin/products/new', {
      state: {
        prefill: {
          name: product.product_name,
          price: product.price_range.replace(/[^0-9.-]/g, '').split('-')[0] || '29.99',
          category: product.category,
          slug,
          affiliate_url: amazonUrl,
          description: product.trending_reason,
          badge: 'Trending',
        },
      },
    });
  };

  const categoryColors: Record<string, string> = {
    'Lighting': 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    'Decor & Accents': 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
    'Textiles': 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
    'Furniture': 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    'Storage': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    'Wall Art': 'bg-pink-500/15 text-pink-700 dark:text-pink-400',
    'Candles & Fragrance': 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
    'Plants & Planters': 'bg-green-500/15 text-green-700 dark:text-green-400',
    'Rugs': 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400',
    'Kitchen Decor': 'bg-teal-500/15 text-teal-700 dark:text-teal-400',
  };

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Trending on Amazon</CardTitle>
              {week && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {week} • {generatedAt ? new Date(generatedAt).toLocaleDateString() : ''}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="sm"
            variant="outline"
            className="text-xs h-8 rounded-full"
          >
            {isGenerating ? (
              <><RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />Researching...</>
            ) : (
              <><Sparkles className="h-3 w-3 mr-1.5" />Find Trending</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {products.length === 0 ? (
          <div className="text-center py-8 px-4">
            <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground mb-1">No trending products yet</p>
            <p className="text-xs text-muted-foreground/70 mb-4">
              Click "Find Trending" to discover this week's hottest home decor products on Amazon.
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating} size="sm" className="rounded-full">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Discover Now
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[500px] overflow-auto pr-1">
            {products.map((product) => (
              <div
                key={product.rank}
                className="group p-3 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-bold">
                    {product.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold truncate">{product.product_name}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${categoryColors[product.category] || 'bg-muted'}`}>
                            {product.category}
                          </Badge>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {product.price_range}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                      <TrendingUp className="h-3 w-3 inline mr-1 text-orange-500" />
                      {product.trending_reason}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground/70">
                      <Pin className="h-3 w-3" />
                      <span className="truncate italic">"{product.pinterest_title}"</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2.5">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-[11px] rounded-full px-3"
                        onClick={() => handleAddToShop(product)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add To Shop
                      </Button>
                      <a
                        href={`https://www.amazon.com/s?k=${encodeURIComponent(product.search_query)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] rounded-full px-2.5">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Amazon
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendingAmazonProducts;
