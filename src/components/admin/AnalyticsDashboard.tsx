import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useAnalyticsSummary, 
  useDailyAnalytics, 
  useTopBlogPosts, 
  useTopProducts,
  useTopPages,
  DateRange 
} from '@/hooks/useAnalytics';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import { 
  Users, Eye, FileText, MousePointerClick, TrendingUp, TrendingDown,
  ArrowUpRight, Calendar, Loader2, Globe, Activity,
} from 'lucide-react';
import { format } from 'date-fns';

const dateRangeLabels: Record<DateRange, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7days: 'Last 7 Days',
  last30days: 'Last 30 Days',
  last3months: 'Last 3 Months',
};

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>('last7days');
  
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(dateRange);
  const { data: dailyData, isLoading: dailyLoading } = useDailyAnalytics(dateRange);
  const { data: topBlogs } = useTopBlogPosts(dateRange);
  const { data: topProducts } = useTopProducts(dateRange);
  const { data: topPages } = useTopPages(dateRange);

  const formatChartDate = (dateStr: string) => format(new Date(dateStr), 'MMM d');

  const stats = [
    { 
      title: 'Unique Visitors', 
      value: summary?.uniqueVisitors || 0, 
      icon: Users, 
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconBg: 'bg-blue-500',
      borderColor: 'border-blue-500/20',
    },
    { 
      title: 'Page Views', 
      value: summary?.pageViews || 0, 
      icon: Eye, 
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconBg: 'bg-emerald-500',
      borderColor: 'border-emerald-500/20',
    },
    { 
      title: 'Blog Views', 
      value: summary?.blogViews || 0, 
      icon: FileText, 
      gradient: 'from-violet-500/20 to-violet-600/5',
      iconBg: 'bg-violet-500',
      borderColor: 'border-violet-500/20',
    },
    { 
      title: 'Product Clicks', 
      value: summary?.productClicks || 0, 
      icon: MousePointerClick, 
      gradient: 'from-amber-500/20 to-amber-600/5',
      iconBg: 'bg-amber-500',
      borderColor: 'border-amber-500/20',
    },
  ];

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
              <Loader2 className="h-7 w-7 animate-spin text-accent" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md">
            <Activity className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Site Analytics</h2>
            <p className="text-xs text-muted-foreground">Real visitors only · Admin views excluded</p>
          </div>
        </div>
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <TabsList className="bg-muted/60 backdrop-blur-sm border border-border/50 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="today" className="text-[10px] md:text-xs px-2.5 md:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">Today</TabsTrigger>
            <TabsTrigger value="yesterday" className="text-[10px] md:text-xs px-2.5 md:px-3 hidden sm:inline-flex data-[state=active]:bg-background data-[state=active]:shadow-sm">Yesterday</TabsTrigger>
            <TabsTrigger value="last7days" className="text-[10px] md:text-xs px-2.5 md:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">7D</TabsTrigger>
            <TabsTrigger value="last30days" className="text-[10px] md:text-xs px-2.5 md:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">30D</TabsTrigger>
            <TabsTrigger value="last3months" className="text-[10px] md:text-xs px-2.5 md:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">3M</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Grid — Premium Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`relative overflow-hidden border ${stat.borderColor} bg-gradient-to-br ${stat.gradient} backdrop-blur-sm`}>
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5">
                  <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2xl md:text-3xl font-bold tracking-tight font-display">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`h-9 w-9 md:h-11 md:w-11 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Traffic Overview — Full Width */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="p-4 md:p-6 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-accent" />
                </div>
                <CardTitle className="text-sm md:text-base font-semibold">Traffic Overview</CardTitle>
              </div>
              <Badge variant="secondary" className="font-normal text-[10px] md:text-xs bg-muted/60">{dateRangeLabels[dateRange]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <div className="h-[220px] md:h-[300px]">
              {dailyLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : dailyData && dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ left: -20, right: 4, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatChartDate} fontSize={10} tickLine={false} axisLine={false} className="text-muted-foreground" dy={8} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} className="text-muted-foreground" width={30} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        boxShadow: '0 8px 30px -10px hsl(var(--foreground) / 0.1)',
                        padding: '12px 16px',
                      }} 
                      labelFormatter={(label) => format(new Date(label), 'MMMM d, yyyy')} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                    <Area type="monotone" dataKey="visitors" name="Visitors" stroke="hsl(var(--accent))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisitors)" dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: 'hsl(var(--background))' }} />
                    <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="hsl(142 76% 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorPageViews)" dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <Globe className="h-7 w-7 opacity-30" />
                  </div>
                  <p className="text-sm font-medium">No analytics data yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Data will appear as visitors browse your site</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Engagement */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="p-4 md:p-6 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-violet-600" />
              </div>
              <CardTitle className="text-sm md:text-base font-semibold">Content Engagement</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <div className="h-[220px] md:h-[260px]">
              {dailyData && dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ left: -20, right: 4, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatChartDate} fontSize={10} tickLine={false} axisLine={false} dy={8} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} width={30} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px', boxShadow: '0 8px 30px -10px hsl(var(--foreground) / 0.1)', padding: '12px 16px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                    <Bar dataKey="blogViews" name="Blog Views" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="productClicks" name="Product Clicks" fill="hsl(25 95% 53%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 opacity-30" />
                  </div>
                  <p className="text-sm font-medium">No engagement data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="p-4 md:p-6 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Eye className="h-4 w-4 text-emerald-600" />
              </div>
              <CardTitle className="text-sm md:text-base font-semibold">Top Pages</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {topPages && topPages.length > 0 ? (
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div key={page.path} className="flex items-center gap-3 group">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      index === 0 ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate group-hover:text-accent transition-colors">{page.path}</p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] md:text-xs bg-muted/60 shrink-0">{page.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-xs">No page view data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Blog Posts */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="p-4 md:p-6 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-violet-600" />
                </div>
                <CardTitle className="text-sm md:text-base font-semibold">Top Blog Posts</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {topBlogs && topBlogs.length > 0 ? (
              <div className="space-y-3">
                {topBlogs.map((blog, index) => (
                  <div key={blog.entity_id} className="flex items-center gap-3 group">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm' : 
                      index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-sm' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate group-hover:text-accent transition-colors">{blog.entity_name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 bg-muted/60 px-2 py-1 rounded-lg">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-semibold">{blog.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-5 w-5 opacity-30" />
                </div>
                <p className="text-xs">No blog views yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="p-4 md:p-6 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <MousePointerClick className="h-4 w-4 text-amber-600" />
                </div>
                <CardTitle className="text-sm md:text-base font-semibold">Top Products</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.entity_id} className="flex items-center gap-3 group">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm' : 
                      index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-sm' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate group-hover:text-accent transition-colors">{product.entity_name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 bg-muted/60 px-2 py-1 rounded-lg">
                      <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-semibold">{product.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <MousePointerClick className="h-5 w-5 opacity-30" />
                </div>
                <p className="text-xs">No product clicks yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
