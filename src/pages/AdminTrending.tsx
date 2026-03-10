import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, Sparkles, ExternalLink, Plus, RefreshCw, Flame, Pin,
  Search, SlidersHorizontal, Star, DollarSign, ArrowUpDown, LayoutGrid, List,
} from 'lucide-react';

interface TrendingProduct {
  rank: number;
  product_name: string;
  price_range: string;
  price_low: number;
  price_high: number;
  trending_reason: string;
  description: string;
  pinterest_title: string;
  category: string;
  search_query: string;
  estimated_rating: number;
  estimated_reviews: number;
}

const ALL_CATEGORIES = [
  'All Categories',
  'Lighting',
  'Decor & Accents',
  'Textiles',
  'Furniture',
  'Storage',
  'Wall Art',
  'Candles & Fragrance',
  'Plants & Planters',
  'Rugs',
  'Kitchen Decor',
];

const categoryIcons: Record<string, string> = {
  'Lighting': '💡',
  'Decor & Accents': '🏺',
  'Textiles': '🧶',
  'Furniture': '🪑',
  'Storage': '📦',
  'Wall Art': '🖼️',
  'Candles & Fragrance': '🕯️',
  'Plants & Planters': '🌿',
  'Rugs': '🧵',
  'Kitchen Decor': '🍳',
};

const categoryColors: Record<string, string> = {
  'Lighting': 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20',
  'Decor & Accents': 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20',
  'Textiles': 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20',
  'Furniture': 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'Storage': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  'Wall Art': 'bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-500/20',
  'Candles & Fragrance': 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20',
  'Plants & Planters': 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20',
  'Rugs': 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  'Kitchen Decor': 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/20',
};

const AdminTrending = () => {
  const { data: settings } = useSiteSettings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [week, setWeek] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('rank');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
          price: product.price_low ? `$${product.price_low}` : product.price_range.replace(/[^0-9.-]/g, '').split('-')[0] || '29.99',
          original_price: product.price_high ? `$${product.price_high}` : '',
          category: product.category,
          slug,
          affiliate_url: amazonUrl,
          description: product.description || product.trending_reason,
          badge: 'Trending',
          rating: product.estimated_rating?.toString() || '4.5',
          reviews: product.estimated_reviews?.toString() || '0',
          meta_title: `${product.product_name} - Best Home Decor Deal`,
          meta_description: product.description || product.trending_reason,
        },
      },
    });
  };

  // Unique categories from actual products
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All Categories', ...Array.from(cats)];
  }, [products]);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== 'All Categories') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.product_name.toLowerCase().includes(q) ||
        p.trending_reason.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.price_low || 0) - (b.price_low || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price_low || 0) - (a.price_low || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.estimated_rating || 0) - (a.estimated_rating || 0));
        break;
      case 'reviews':
        result.sort((a, b) => (b.estimated_reviews || 0) - (a.estimated_reviews || 0));
        break;
      default:
        result.sort((a, b) => a.rank - b.rank);
    }

    return result;
  }, [products, activeCategory, sortBy, searchQuery]);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight">Trending Products</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {week ? `${week} • Updated ${generatedAt ? new Date(generatedAt).toLocaleDateString() : ''}` : 'AI-powered Amazon trend discovery'}
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25 h-10 px-6 font-medium"
            >
              {isGenerating ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Researching...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Find Trending</>
              )}
            </Button>
          </div>

          {/* Category Filter Chips */}
          {products.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    activeCategory === cat
                      ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                      : 'bg-background border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {cat !== 'All Categories' && <span>{categoryIcons[cat] || '📦'}</span>}
                  {cat === 'All Categories' ? `All (${products.length})` : `${cat} (${categoryCount[cat] || 0})`}
                </button>
              ))}
            </div>
          )}

          {/* Search & Sort Bar */}
          {products.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trending products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 rounded-xl border-border/50"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] h-10 rounded-xl border-border/50">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rank">By Rank</SelectItem>
                    <SelectItem value="price-low">Price: Low → High</SelectItem>
                    <SelectItem value="price-high">Price: High → Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border border-border/50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <Card className="border-border/30 rounded-2xl">
            <CardContent className="text-center py-16 px-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/15 to-red-500/15 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-500/60" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">No trending products yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Click "Find Trending" to let AI discover this week's hottest home decor products on Amazon — bestsellers, movers & shakers, and viral picks.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-8"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Discover Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        {products.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
            {activeCategory !== 'All Categories' && ` in ${activeCategory}`}
          </p>
        )}

        {/* Grid View */}
        {filteredProducts.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.rank} className="border-border/30 rounded-2xl overflow-hidden hover:shadow-md transition-all group">
                {/* Card header gradient */}
                <div className={`h-1.5 ${
                  categoryColors[product.category]?.includes('amber') ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                  categoryColors[product.category]?.includes('rose') ? 'bg-gradient-to-r from-rose-400 to-rose-500' :
                  categoryColors[product.category]?.includes('purple') ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                  categoryColors[product.category]?.includes('blue') ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                  categoryColors[product.category]?.includes('emerald') ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                  categoryColors[product.category]?.includes('pink') ? 'bg-gradient-to-r from-pink-400 to-pink-500' :
                  categoryColors[product.category]?.includes('orange') ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                  categoryColors[product.category]?.includes('green') ? 'bg-gradient-to-r from-green-400 to-green-500' :
                  categoryColors[product.category]?.includes('indigo') ? 'bg-gradient-to-r from-indigo-400 to-indigo-500' :
                  'bg-gradient-to-r from-teal-400 to-teal-500'
                }`} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-bold">
                      #{product.rank}
                    </span>
                    <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 border ${categoryColors[product.category] || 'bg-muted'}`}>
                      {categoryIcons[product.category] || '📦'} {product.category}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2">{product.product_name}</h3>

                  {product.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price & Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-bold text-foreground flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {product.price_range}
                    </span>
                    {product.estimated_rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold">{product.estimated_rating}</span>
                        {product.estimated_reviews > 0 && (
                          <span className="text-[10px] text-muted-foreground">({product.estimated_reviews.toLocaleString()})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Trending Reason */}
                  <div className="p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10 mb-3">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <TrendingUp className="h-3 w-3 inline mr-1 text-orange-500" />
                      {product.trending_reason}
                    </p>
                  </div>

                  {/* Pinterest Title */}
                  <div className="flex items-start gap-1.5 mb-4 text-[10px] text-muted-foreground/70">
                    <Pin className="h-3 w-3 shrink-0 mt-0.5" />
                    <span className="italic line-clamp-1">"{product.pinterest_title}"</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-9 text-xs rounded-xl font-medium"
                      onClick={() => handleAddToShop(product)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add To Shop
                    </Button>
                    <a
                      href={`https://www.amazon.com/s?k=${encodeURIComponent(product.search_query)}&tag=roomrefine-20`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="h-9 text-xs rounded-xl px-3">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* List View */}
        {filteredProducts.length > 0 && viewMode === 'list' && (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <Card key={product.rank} className="border-border/30 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-bold">
                      #{product.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm">{product.product_name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 border ${categoryColors[product.category] || 'bg-muted'}`}>
                              {categoryIcons[product.category]} {product.category}
                            </Badge>
                            <span className="text-sm font-bold">{product.price_range}</span>
                            {product.estimated_rating > 0 && (
                              <span className="flex items-center gap-1 text-xs">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {product.estimated_rating}
                                {product.estimated_reviews > 0 && (
                                  <span className="text-muted-foreground">({product.estimated_reviews.toLocaleString()})</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" className="h-8 text-xs rounded-xl" onClick={() => handleAddToShop(product)}>
                            <Plus className="h-3 w-3 mr-1" />Add To Shop
                          </Button>
                          <a
                            href={`https://www.amazon.com/s?k=${encodeURIComponent(product.search_query)}&tag=roomrefine-20`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="h-8 text-xs rounded-xl px-2.5">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      </div>
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{product.description}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        <TrendingUp className="h-3 w-3 inline mr-1 text-orange-500" />
                        {product.trending_reason}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No results after filter */}
        {products.length > 0 && filteredProducts.length === 0 && (
          <Card className="border-border/30 rounded-2xl">
            <CardContent className="text-center py-12">
              <Search className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No products match your filters</p>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setActiveCategory('All Categories'); setSearchQuery(''); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTrending;
