import { Link } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAllBlogPosts, useDeleteBlogPost, useTogglePublishStatus } from '@/hooks/useBlogPosts';
import { useAllProducts } from '@/hooks/useProducts';
import { useNewsletterSubscribers } from '@/hooks/useNewsletterSubscribers';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useToast } from '@/hooks/use-toast';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  FileText, 
  Package, 
  Users, 
  TrendingUp,
  Clock,
  ArrowRight,
  Image,
  Settings,
  BarChart3,
  LayoutDashboard,
} from 'lucide-react';

const Admin = () => {
  const { data: posts, isLoading, error } = useAllBlogPosts();
  const { data: products } = useAllProducts();
  const { data: subscribers } = useNewsletterSubscribers();
  const { data: activityLogs } = useActivityLogs();
  const deleteMutation = useDeleteBlogPost();
  const togglePublishMutation = useTogglePublishStatus();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Post deleted',
        description: 'The blog post has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the post.',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublishMutation.mutateAsync({ id, published: !currentStatus });
      toast({
        title: currentStatus ? 'Post unpublished' : 'Post published',
        description: currentStatus
          ? 'The post is now a draft.'
          : 'The post is now live.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update publish status.',
        variant: 'destructive',
      });
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
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-medium">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's an overview of your site.
            </p>
          </div>
          <Link to="/admin/blog/new">
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Posts</p>
                      <p className="font-display text-3xl font-medium mt-1">
                        {posts?.length || 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <Badge variant="secondary" className="text-green-600">
                      {publishedCount} published
                    </Badge>
                    <Badge variant="outline">{draftCount} drafts</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Products</p>
                      <p className="font-display text-3xl font-medium mt-1">
                        {products?.length || 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <Badge variant="secondary" className="text-green-600">
                      {activeProducts} active
                    </Badge>
                    <Badge variant="outline">{featuredProducts} featured</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Subscribers</p>
                      <p className="font-display text-3xl font-medium mt-1">
                        {subscribers?.length || 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <Badge variant="secondary" className="text-blue-600">
                      {activeSubscribers} active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Recent Activity</p>
                      <p className="font-display text-3xl font-medium mt-1">
                        {activityLogs?.length || 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Last 30 days
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/admin/blog/new">
                    <Button variant="ghost" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        New Blog Post
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/admin/products/new">
                    <Button variant="ghost" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        New Product
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/admin/media">
                    <Button variant="ghost" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Media Library
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/admin/settings">
                    <Button variant="ghost" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Site Settings
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLogs && activityLogs.length > 0 ? (
                    <div className="space-y-4">
                      {activityLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-start gap-3 text-sm">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            {log.entity_type === 'blog_post' && <FileText className="h-4 w-4" />}
                            {log.entity_type === 'product' && <Package className="h-4 w-4" />}
                            {log.entity_type === 'subscriber' && <Users className="h-4 w-4" />}
                            {!['blog_post', 'product', 'subscriber'].includes(log.entity_type) && (
                              <TrendingUp className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              <span className={getActionColor(log.action)}>{log.action}</span>
                              {log.entity_name && `: ${log.entity_name}`}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatActivityTime(log.created_at || '')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      No recent activity to show.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Posts Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Blog Posts</CardTitle>
                <Link to="/admin/blog/new">
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Plus className="mr-2 h-4 w-4" />
                    New Post
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading posts...
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-destructive">
                    Error loading posts
                  </div>
                ) : posts && posts.length > 0 ? (
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
                            <div>
                              <p className="font-medium line-clamp-1">{post.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {post.excerpt}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{post.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={post.published ? 'default' : 'outline'}>
                              {post.published ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePublish(post.id, post.published)}
                                disabled={togglePublishMutation.isPending}
                              >
                                {post.published ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Link to={`/admin/blog/edit/${post.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{post.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(post.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium mb-2">No posts yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Create your first blog post to get started.
                    </p>
                    <Link to="/admin/blog/new">
                      <Button className="rounded-full">
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
