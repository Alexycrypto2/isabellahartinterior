import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClickSourceAnalytics, DateRange } from '@/hooks/useAnalytics';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { MousePointerClick, Target, Layers, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const SOURCE_COLORS = [
  'hsl(var(--primary))',
  'hsl(25 95% 53%)',    // orange
  'hsl(142 76% 36%)',   // green
  'hsl(262 83% 58%)',   // purple
  'hsl(197 87% 45%)',   // cyan
  'hsl(340 82% 52%)',   // pink
  'hsl(43 96% 56%)',    // amber
  'hsl(173 80% 40%)',   // teal
];

const dateRangeLabels: Record<DateRange, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7days: 'Last 7 Days',
  last30days: 'Last 30 Days',
  last3months: 'Last 3 Months',
};

const AffiliateClicksDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>('last30days');
  const { data, isLoading } = useClickSourceAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pieData = (data?.sources || []).map((s, i) => ({
    name: s.source,
    value: s.clicks,
    fill: SOURCE_COLORS[i % SOURCE_COLORS.length],
  }));

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg md:text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Affiliate Click Sources
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Track which pages and placements drive Amazon affiliate clicks
          </p>
        </div>
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <TabsList className="bg-muted/50 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="today" className="text-[10px] md:text-xs px-2 md:px-3">Today</TabsTrigger>
            <TabsTrigger value="last7days" className="text-[10px] md:text-xs px-2 md:px-3">7D</TabsTrigger>
            <TabsTrigger value="last30days" className="text-[10px] md:text-xs px-2 md:px-3">30D</TabsTrigger>
            <TabsTrigger value="last3months" className="text-[10px] md:text-xs px-2 md:px-3">3M</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Total Clicks Banner */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <MousePointerClick className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Affiliate Clicks</p>
              <p className="text-3xl font-bold">{(data?.totalClicks || 0).toLocaleString()}</p>
            </div>
            <Badge variant="secondary" className="ml-auto font-normal text-xs">
              {dateRangeLabels[dateRange]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {!data || data.totalClicks === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MousePointerClick className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">No affiliate click data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Clicks will be tracked with UTM sources as visitors interact with product links
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Source Breakdown Pie */}
            <Card>
              <CardHeader className="p-4 md:p-6 pb-2">
                <CardTitle className="text-base font-semibold">Clicks by Source</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6 pt-0">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Clicks by Medium */}
            <Card>
              <CardHeader className="p-4 md:p-6 pb-2">
                <CardTitle className="text-base font-semibold">Clicks by Placement</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6 pt-0">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.mediums}
                      layout="vertical"
                      margin={{ left: 10, right: 20, top: 4, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                      <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis
                        type="category"
                        dataKey="medium"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="clicks" name="Clicks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Trend by Source */}
          {data.dailyTrends.length > 1 && (
            <Card>
              <CardHeader className="p-4 md:p-6 pb-2">
                <CardTitle className="text-base font-semibold">Daily Click Trend by Source</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6 pt-0">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.dailyTrends} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => format(new Date(d), 'MMM d')}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} width={30} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelFormatter={(label) => format(new Date(label), 'MMMM d, yyyy')}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      {data.topSources.map((source, i) => (
                        <Bar
                          key={source}
                          dataKey={source}
                          name={source}
                          stackId="clicks"
                          fill={SOURCE_COLORS[i % SOURCE_COLORS.length]}
                          radius={i === data.topSources.length - 1 ? [4, 4, 0, 0] : undefined}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Breakdown Table */}
          <Card>
            <CardHeader className="p-4 md:p-6 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">Source × Placement Breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-2">
              <div className="space-y-2">
                {data.breakdown.map((row, i) => {
                  const pct = data.totalClicks > 0 ? (row.clicks / data.totalClicks) * 100 : 0;
                  return (
                    <div key={`${row.source}-${row.medium}`} className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{row.source}</span>
                          <span className="text-xs text-muted-foreground">→</span>
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {row.medium}
                          </Badge>
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold">{row.clicks}</span>
                        <span className="text-xs text-muted-foreground">({pct.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AffiliateClicksDashboard;
