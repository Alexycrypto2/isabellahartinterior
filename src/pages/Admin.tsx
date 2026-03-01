import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
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
import {
  Plus, Edit, Trash2, Eye, EyeOff, FileText, Package, Users, TrendingUp,
  Clock, ArrowRight, Image, Settings, BarChart3, LayoutDashboard, Bot, Zap, AlertTriangle, CheckCircle2, Info,
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
      setAiStatus('active'); // Built-in AI assumed active
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

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('published')) return 'text-green-600';
    if (action.includes('deleted')) return 'text-red-600';
    if (action.includes('updated')) return 'text-blue-600';
    return 'text-muted-foreground';
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-medium">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Welcome back! Here's an overview of your site.
            </p>
          </div>
          <Link to="/admin/blog/new">
            <Button className="rounded-full w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="analytics" className="space-y-4 md:space-y-6">
          <TabsList className="bg-muted/50 p-1 w-full sm:w-auto">
            <TabsTrigger value="analytics" className="flex items-center gap-2 flex-1 sm:flex-auto">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2 flex-1 sm:flex-auto">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Total Posts</p>
                      <p className="font-display text-2xl md:text-3xl font-medium mt-1">{posts?.length || 0}</p>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2 md:mt-3 text-xs md:text-sm">
                    <Badge variant="secondary" className="text-green-600">{publishedCount} published</Badge>
                    <Badge variant="outline">{draftCount} drafts</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Products</p>
                      <p className="font-display text-2xl md:text-3xl font-medium mt-1">{products?.length || 0}</p>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2 md:mt-3 text-xs md:text-sm">
                    <Badge variant="secondary" className="text-green-600">{activeProducts} active</Badge>
                    <Badge variant="outline">{featuredProducts} featured</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Subscribers</p>
                      <p className="font-display text-2xl md:text-3xl font-medium mt-1">{subscribers?.length || 0}</p>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2 md:mt-3 text-xs md:text-sm">
                    <Badge variant="secondary" className="text-blue-600">{activeSubscribers} active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Activity</p>
                      <p className="font-display text-2xl md:text-3xl font-medium mt-1">{activityLogs?.length || 0}</p>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-3 text-xs md:text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Last 30 days
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Status Indicator */}
            <Card className="border-border">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm md:text-base">AI Service Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Built-in AI Active</span>
                      </div>
                    </div>
                  </div>
                  <Link to="/admin/settings">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Text AI Status */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Text AI</span>
                      <span className="text-[10px] text-muted-foreground">Blog, Chat, Recs</span>
                    </div>
                    {hasTextKey ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-medium">
                          Fallback: {textProvider === 'openai' ? 'OpenAI' : textProvider === 'google' ? 'Gemini' : textProvider === 'anthropic' ? 'Claude' : textProvider === 'custom' ? 'Custom' : 'Configured'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs text-muted-foreground">No fallback key</span>
                      </div>
                    )}
                  </div>

                  {/* Image AI Status */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Image AI</span>
                      <span className="text-[10px] text-muted-foreground">Blog Images</span>
                    </div>
                    {hasImageKey ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-medium">
                          Fallback: {imageProvider === 'openai' ? 'DALL·E' : imageProvider === 'google' ? 'Imagen' : imageProvider === 'custom' ? 'Custom' : 'Configured'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs text-muted-foreground">No fallback key</span>
                      </div>
                    )}
                  </div>
                </div>

                {(!hasTextKey || !hasImageKey) && (
                  <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      <Zap className="h-3 w-3 inline mr-1 text-amber-500" />
                      Add fallback API keys in <Link to="/admin/settings" className="underline font-medium text-foreground">Settings → AI API</Link> to keep AI features running when built-in credits are exhausted.
                    </p>
                  </div>
                )}

                <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    <Info className="h-3 w-3 inline mr-1 text-primary" />
                    Built-in AI credits are usage-based. When exhausted, you'll get a notification and the system auto-switches to your fallback keys. To check or top up credits, visit your <strong className="text-foreground">Lovable workspace settings → Usage</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <Card>
                <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 space-y-1">
                  <Link to="/admin/blog/new">
                    <Button variant="ghost" className="w-full justify-between h-10">
                      <span className="flex items-center gap-2 text-sm"><Plus className="h-4 w-4" />New Blog Post</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/admin/products/new">
                    <Button variant="ghost" className="w-full justify-between h-10">
                      <span className="flex items-center gap-2 text-sm"><Package className="h-4 w-4" />New Product</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/admin/media">
                    <Button variant="ghost" className="w-full justify-between h-10">
                      <span className="flex items-center gap-2 text-sm"><Image className="h-4 w-4" />Media Library</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/admin/settings">
                    <Button variant="ghost" className="w-full justify-between h-10">
                      <span className="flex items-center gap-2 text-sm"><Settings className="h-4 w-4" />Site Settings</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  {activityLogs && activityLogs.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                      {activityLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-start gap-3 text-sm">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            {log.entity_type === 'blog_post' && <FileText className="h-4 w-4" />}
                            {log.entity_type === 'product' && <Package className="h-4 w-4" />}
                            {log.entity_type === 'subscriber' && <Users className="h-4 w-4" />}
                            {!['blog_post', 'product', 'subscriber'].includes(log.entity_type) && <TrendingUp className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-xs md:text-sm">
                              <span className={getActionColor(log.action)}>{log.action}</span>
                              {log.entity_name && `: ${log.entity_name}`}
                            </p>
                            <p className="text-muted-foreground text-xs">{formatActivityTime(log.created_at || '')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-6">No recent activity to show.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Posts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Recent Blog Posts</CardTitle>
                <Link to="/admin/blog/new">
                  <Button size="sm" variant="outline" className="rounded-full text-xs md:text-sm">
                    <Plus className="mr-1 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
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
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {posts.slice(0, 5).map((post) => (
                            <TableRow key={post.id}>
                              <TableCell>
                                <p className="font-medium line-clamp-1">{post.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                              </TableCell>
                              <TableCell><Badge variant="secondary">{post.category}</Badge></TableCell>
                              <TableCell>
                                <Badge variant={post.published ? 'default' : 'outline'}>{post.published ? 'Published' : 'Draft'}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(post.id, post.published)} disabled={togglePublishMutation.isPending}>
                                    {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                  <Link to={`/admin/blog/edit/${post.id}`}><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></Link>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
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
                    <div className="md:hidden divide-y">
                      {posts.slice(0, 5).map((post) => (
                        <div key={post.id} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.excerpt}</p>
                            </div>
                            <Badge variant={post.published ? 'default' : 'outline'} className="text-xs flex-shrink-0">
                              {post.published ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleTogglePublish(post.id, post.published)}>
                                {post.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </Button>
                              <Link to={`/admin/blog/edit/${post.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
                  <div className="p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium mb-2">No posts yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">Create your first blog post to get started.</p>
                    <Link to="/admin/blog/new"><Button className="rounded-full"><Plus className="mr-2 h-4 w-4" />Create Post</Button></Link>
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
