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
  ArrowUpRight, Calendar, Loader2,
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
    { title: 'Unique Visitors', value: summary?.uniqueVisitors || 0, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-500/10', trend: '+12%', trendUp: true },
    { title: 'Page Views', value: summary?.pageViews || 0, icon: Eye, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10', trend: '+8%', trendUp: true },
    { title: 'Blog Views', value: summary?.blogViews || 0, icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-500/10', trend: '+23%', trendUp: true },
    { title: 'Product Clicks', value: summary?.productClicks || 0, icon: MousePointerClick, color: 'text-orange-600', bgColor: 'bg-orange-500/10', trend: '-5%', trendUp: false },
  ];

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          <span className="text-xs md:text-sm text-muted-foreground">Analytics for:</span>
        </div>
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <TabsList className="bg-muted/50 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="today" className="text-[10px] md:text-xs px-2 md:px-3">Today</TabsTrigger>
            <TabsTrigger value="yesterday" className="text-[10px] md:text-xs px-2 md:px-3 hidden sm:inline-flex">Yesterday</TabsTrigger>
            <TabsTrigger value="last7days" className="text-[10px] md:text-xs px-2 md:px-3">7D</TabsTrigger>
            <TabsTrigger value="last30days" className="text-[10px] md:text-xs px-2 md:px-3">30D</TabsTrigger>
            <TabsTrigger value="last3months" className="text-[10px] md:text-xs px-2 md:px-3">3M</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-start justify-between gap-1">
                <div className="space-y-1 md:space-y-2 min-w-0">
                  <p className="text-[10px] md:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                  <p className="text-xl md:text-3xl font-bold tracking-tight">
                    {stat.value.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1">
                    {stat.trendUp ? (
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-[10px] md:text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                      {stat.trend}
                    </span>
                    <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline">vs prev</span>
                  </div>
                </div>
                <div className={`h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`h-4 w-4 md:h-6 md:w-6 ${stat.color}`} />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.bgColor}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Traffic Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 md:p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg font-semibold">Traffic Overview</CardTitle>
              <Badge variant="secondary" className="font-normal text-xs">{dateRangeLabels[dateRange]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <div className="h-[200px] md:h-[300px]">
              {dailyLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : dailyData && dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tickFormatter={formatChartDate} fontSize={10} tickLine={false} axisLine={false} className="text-muted-foreground" />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} className="text-muted-foreground" width={30} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} labelFormatter={(label) => format(new Date(label), 'MMMM d, yyyy')} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="visitors" name="Visitors" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
                    <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="hsl(142 76% 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorPageViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Eye className="h-10 w-10 md:h-12 md:w-12 mb-3 md:mb-4 opacity-20" />
                  <p className="text-xs md:text-sm">No analytics data yet</p>
                  <p className="text-[10px] md:text-xs">Data will appear as visitors browse your site</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Engagement */}
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardTitle className="text-base md:text-lg font-semibold">Content Engagement</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <div className="h-[200px] md:h-[250px]">
              {dailyData && dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tickFormatter={formatChartDate} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} width={30} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="blogViews" name="Blog Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="productClicks" name="Product Clicks" fill="hsl(25 95% 53%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-xs md:text-sm">No engagement data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardTitle className="text-base md:text-lg font-semibold">Top Pages</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {topPages && topPages.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {topPages.map((page, index) => (
                  <div key={page.path} className="flex items-center gap-3">
                    <span className="text-xs md:text-sm font-medium text-muted-foreground w-5">{index + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{page.path}</p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">{page.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <p className="text-xs md:text-sm">No page view data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Blog Posts */}
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg font-semibold">Top Blog Posts</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-8">
                View All <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {topBlogs && topBlogs.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {topBlogs.map((blog, index) => (
                  <div key={blog.entity_id} className="flex items-center gap-3">
                    <div className={`h-7 w-7 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0
                      ${index === 0 ? 'bg-yellow-500/10 text-yellow-600' : 
                        index === 1 ? 'bg-gray-200 text-gray-600' : 
                        index === 2 ? 'bg-orange-500/10 text-orange-600' : 
                        'bg-muted text-muted-foreground'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{blog.entity_name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs md:text-sm font-medium">{blog.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-xs md:text-sm">No blog views yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg font-semibold">Top Products</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-8">
                View All <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.entity_id} className="flex items-center gap-3">
                    <div className={`h-7 w-7 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0
                      ${index === 0 ? 'bg-yellow-500/10 text-yellow-600' : 
                        index === 1 ? 'bg-gray-200 text-gray-600' : 
                        index === 2 ? 'bg-orange-500/10 text-orange-600' : 
                        'bg-muted text-muted-foreground'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{product.entity_name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <MousePointerClick className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs md:text-sm font-medium">{product.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <MousePointerClick className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-xs md:text-sm">No product clicks yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
