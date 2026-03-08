import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import WidgetErrorBoundary from '@/components/WidgetErrorBoundary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAllBlogPosts, useDeleteBlogPost, useTogglePublishStatus } from '@/hooks/useBlogPosts';
import { useAllProducts } from '@/hooks/useProducts';
import { useNewsletterSubscribers } from '@/hooks/useNewsletterSubscribers';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import AffiliateClicksDashboard from '@/components/admin/AffiliateClicksDashboard';
import WeeklyTrendsCard from '@/components/admin/WeeklyTrendsCard';
import RevenueTracker from '@/components/admin/RevenueTracker';
import BrokenLinksChecker from '@/components/admin/BrokenLinksChecker';
import ExitIntentStats from '@/components/admin/ExitIntentStats';
import {
  Plus, Edit, Trash2, Eye, EyeOff, FileText, Package, Users, TrendingUp,
  Clock, ArrowRight, Image, Settings, BarChart3, LayoutDashboard, Bot, Zap, AlertTriangle, CheckCircle2, Info,
  Sparkles, Mail, PenSquare, ShoppingBag,
} from 'lucide-react';

const Admin = () => {
  const { data: posts, isLoading, error } = useAllBlogPosts();
  const { data: products } = useAllProducts();
  const { data: subscribers } = useNewsletterSubscribers();
  const { data: activityLogs } = useActivityLogs();
  const { data: siteSettings } = useSiteSettings();
  const deleteMutation = useDeleteBlogPost();
  const togglePublishMutation = useTogglePublishStatus();
  const { toast } = useToast();

  // AI status
  const [aiStatus, setAiStatus] = useState<'checking' | 'active' | 'fallback_only' | 'no_ai'>('checking');
  const [hasTextKey, setHasTextKey] = useState(false);
  const [hasImageKey, setHasImageKey] = useState(false);
  const [textProvider, setTextProvider] = useState('');
  const [imageProvider, setImageProvider] = useState('');

  useEffect(() => {
    if (siteSettings) {
      const aiSetting = siteSettings.find(s => s.key === 'ai_api');
      const aiConfig = aiSetting?.value as Record<string, string> | undefined;
      const tKey = !!(aiConfig?.text_api_key || aiConfig?.api_key);
      const iKey = !!(aiConfig?.image_api_key);
      setHasTextKey(tKey);
      setHasImageKey(iKey);
      setTextProvider(aiConfig?.text_provider || aiConfig?.provider || '');
      setImageProvider(aiConfig?.image_provider || '');
      setAiStatus('active');
    }
  }, [siteSettings]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Post deleted', description: 'The blog post has been deleted successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete the post.', variant: 'destructive' });
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublishMutation.mutateAsync({ id, published: !currentStatus });
      toast({
        title: currentStatus ? 'Post unpublished' : 'Post published',
        description: currentStatus ? 'The post is now a draft.' : 'The post is now live.',
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update publish status.', variant: 'destructive' });
    }
  };

  const publishedCount = posts?.filter((p) => p.published).length || 0;
  const draftCount = posts?.filter((p) => !p.published).length || 0;
  const activeProducts = products?.filter((p) => p.is_active).length || 0;
  const featuredProducts = products?.filter((p) => p.is_featured).length || 0;
  const activeSubscribers = subscribers?.filter((s) => s.is_active).length || 0;

  const formatActivityTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActionIcon = (entityType: string) => {
    switch (entityType) {
      case 'blog_post': return <FileText className="h-4 w-4 text-violet-500" />;
      case 'product': return <Package className="h-4 w-4 text-emerald-500" />;
      case 'subscriber': return <Users className="h-4 w-4 text-blue-500" />;
      default: return <TrendingUp className="h-4 w-4 text-accent" />;
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('created') || action.includes('published')) 
      return <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">Created</Badge>;
    if (action.includes('deleted')) 
      return <Badge className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Deleted</Badge>;
    if (action.includes('updated')) 
      return <Badge className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20">Updated</Badge>;
    return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{action}</Badge>;
  };

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-accent uppercase tracking-widest mb-1">Dashboard</p>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{getGreeting()} ✨</h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Here's what's happening with your site today.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/admin/blog/new">
                <Button className="rounded-full w-full sm:w-auto bg-accent text-accent-foreground hover:brightness-110 shadow-lg shadow-accent/20 h-10 px-6 font-medium">
                  <Plus className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-muted/30 backdrop-blur-md border border-border/30 p-1 w-full sm:w-auto shadow-sm rounded-2xl">
            <TabsTrigger value="analytics" className="flex items-center gap-2 flex-1 sm:flex-auto data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl text-xs md:text-sm font-medium transition-all">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="affiliates" className="flex items-center gap-2 flex-1 sm:flex-auto data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl text-xs md:text-sm font-medium transition-all">
              <TrendingUp className="h-4 w-4" />
              Affiliates
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2 flex-1 sm:flex-auto data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl text-xs md:text-sm font-medium transition-all">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <WidgetErrorBoundary name="Analytics Dashboard">
              <AnalyticsDashboard />
            </WidgetErrorBoundary>
          </TabsContent>

          <TabsContent value="affiliates">
            <WidgetErrorBoundary name="Affiliate Clicks">
              <AffiliateClicksDashboard />
            </WidgetErrorBoundary>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
              <Card className="relative overflow-hidden border-border/30 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent shadow-sm rounded-2xl">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest">Blog Posts</p>
                      <p className="text-2xl md:text-3xl font-bold tracking-tight font-display">{posts?.length || 0}</p>
                    </div>
                    <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3 text-xs">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] rounded-lg">{publishedCount} live</Badge>
                    <Badge variant="outline" className="text-[10px] border-border/40 rounded-lg">{draftCount} drafts</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-border/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-sm rounded-2xl">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest">Products</p>
                      <p className="text-2xl md:text-3xl font-bold tracking-tight font-display">{products?.length || 0}</p>
                    </div>
                    <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3 text-xs">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] rounded-lg">{activeProducts} active</Badge>
                    <Badge variant="outline" className="text-[10px] border-border/40 rounded-lg">{featuredProducts} featured</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-border/30 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent shadow-sm rounded-2xl">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest">Subscribers</p>
                      <p className="text-2xl md:text-3xl font-bold tracking-tight font-display">{subscribers?.length || 0}</p>
                    </div>
                    <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3 text-xs">
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 text-[10px] rounded-lg">{activeSubscribers} active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-border/30 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent shadow-sm rounded-2xl">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest">Activity</p>
                      <p className="text-2xl md:text-3xl font-bold tracking-tight font-display">{activityLogs?.length || 0}</p>
                    </div>
                    <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg shadow-accent/25">
                      <TrendingUp className="h-5 w-5 text-accent-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px]">Last 30 days</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Status — Premium */}
            <Card className="border-border/30 shadow-sm overflow-hidden rounded-2xl">
              <div className="bg-gradient-to-r from-accent/5 via-transparent to-accent/5">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
                        <Bot className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm md:text-base">AI Engine</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                          <span className="text-xs text-emerald-600 font-medium">All systems operational</span>
                        </div>
                      </div>
                    </div>
                    <Link to="/admin/settings">
                      <Button variant="outline" size="sm" className="text-xs h-8 px-3 rounded-full border-border/50">
                        <Settings className="h-3.5 w-3.5 mr-1.5" />
                        Configure
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-background/80 border border-border/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold">Text Generation</span>
                        <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">Blog · Chat · Recs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-medium">Built-in AI Active</span>
                      </div>
                      {hasTextKey && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <Zap className="h-3.5 w-3.5 text-accent" />
                          <span className="text-[10px] text-muted-foreground">
                            Fallback: {textProvider === 'openai' ? 'OpenAI' : textProvider === 'google' ? 'Gemini' : textProvider === 'anthropic' ? 'Claude' : 'Custom'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-background/80 border border-border/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold">Image Generation</span>
                        <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">Blog Images</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-medium">Built-in AI Active</span>
                      </div>
                      {hasImageKey && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <Zap className="h-3.5 w-3.5 text-accent" />
                          <span className="text-[10px] text-muted-foreground">
                            Fallback: {imageProvider === 'openai' ? 'DALL·E' : imageProvider === 'google' ? 'Imagen' : 'Custom'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {(!hasTextKey || !hasImageKey) && (
                    <div className="mt-3 p-3 rounded-xl bg-accent/5 border border-accent/15">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <Sparkles className="h-3.5 w-3.5 inline mr-1 text-accent" />
                        Add fallback API keys in <Link to="/admin/settings" className="underline font-medium text-foreground hover:text-accent transition-colors">Settings → AI API</Link> for uninterrupted service when built-in credits are exhausted.
                      </p>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>

            {/* Weekly Trends & Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <WeeklyTrendsCard />
              <RevenueTracker />
            </div>

            {/* Broken Links & Exit Intent Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BrokenLinksChecker />
              <ExitIntentStats />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Quick Actions — Premium */}
              <Card className="border-border/30 shadow-sm rounded-2xl">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-accent" />
                    </div>
                    <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-1">
                  {[
                    { to: '/admin/blog/new', icon: PenSquare, label: 'New Blog Post', color: 'text-violet-500' },
                    { to: '/admin/products/new', icon: ShoppingBag, label: 'New Product', color: 'text-emerald-500' },
                    { to: '/admin/media', icon: Image, label: 'Media Library', color: 'text-blue-500' },
                    { to: '/admin/settings', icon: Settings, label: 'Site Settings', color: 'text-accent' },
                  ].map(({ to, icon: Icon, label, color }) => (
                    <Link key={to} to={to}>
                      <Button variant="ghost" className="w-full justify-between h-11 hover:bg-muted/60 rounded-xl group">
                        <span className="flex items-center gap-2.5 text-sm">
                          <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center group-hover:bg-background transition-colors">
                            <Icon className={`h-3.5 w-3.5 ${color}`} />
                          </div>
                          {label}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity — Premium */}
              <Card className="lg:col-span-2 border-border/30 shadow-sm rounded-2xl">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-accent" />
                    </div>
                    <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  {activityLogs && activityLogs.length > 0 ? (
                    <div className="space-y-3">
                      {activityLogs.slice(0, 6).map((log) => (
                        <div key={log.id} className="flex items-center gap-3 group">
                          <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                            {getActionIcon(log.entity_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate text-xs md:text-sm">
                                {log.entity_name || log.entity_type}
                              </p>
                              {getActionBadge(log.action)}
                            </div>
                            <p className="text-muted-foreground text-[10px] mt-0.5">{formatActivityTime(log.created_at || '')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-5 w-5 opacity-30" />
                      </div>
                      <p className="text-muted-foreground text-sm">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Posts — Premium */}
            <Card className="border-border/30 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-violet-600" />
                  </div>
                  <CardTitle className="text-sm md:text-base font-semibold">Recent Blog Posts</CardTitle>
                </div>
                <Link to="/admin/blog/new">
                  <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground hover:brightness-110 shadow-sm h-8 px-4">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    New Post
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading posts...</div>
                ) : error ? (
                  <div className="p-8 text-center text-destructive">Error loading posts</div>
                ) : posts && posts.length > 0 ? (
                  <>
                    {/* Desktop table */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {posts.slice(0, 5).map((post) => (
                            <TableRow key={post.id} className="border-border/50 hover:bg-muted/30">
                              <TableCell>
                                <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.excerpt}</p>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-[10px] bg-muted/60">{post.category}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] ${post.published 
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20' 
                                  : 'bg-muted text-muted-foreground border-border/50 hover:bg-muted'}`}>
                                  {post.published ? '● Live' : '○ Draft'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/60 rounded-lg" onClick={() => handleTogglePublish(post.id, post.published)} disabled={togglePublishMutation.isPending}>
                                    {post.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                  </Button>
                                  <Link to={`/admin/blog/edit/${post.id}`}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/60 rounded-lg">
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  </Link>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 rounded-lg">
                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                        <AlertDialogDescription>Are you sure you want to delete "{post.title}"? This action cannot be undone.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile card list */}
                    <div className="md:hidden divide-y divide-border/50">
                      {posts.slice(0, 5).map((post) => (
                        <div key={post.id} className="p-4 space-y-2 hover:bg-muted/20 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.excerpt}</p>
                            </div>
                            <Badge className={`text-[10px] shrink-0 ${post.published 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                              : 'bg-muted text-muted-foreground border-border/50'}`}>
                              {post.published ? '● Live' : '○ Draft'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-[10px] bg-muted/60">{post.category}</Badge>
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/60 rounded-lg" onClick={() => handleTogglePublish(post.id, post.published)}>
                                {post.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </Button>
                              <Link to={`/admin/blog/edit/${post.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/60 rounded-lg"><Edit className="h-3.5 w-3.5" /></Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 rounded-lg"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                    <AlertDialogDescription>Are you sure you want to delete "{post.title}"?</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-7 w-7 opacity-30" />
                    </div>
                    <h3 className="font-display font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground text-sm mb-5">Create your first blog post to get started.</p>
                    <Link to="/admin/blog/new">
                      <Button className="rounded-full bg-accent text-accent-foreground hover:brightness-110 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Post
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Admin;
