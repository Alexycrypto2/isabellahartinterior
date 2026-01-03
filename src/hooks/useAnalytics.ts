import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, subWeeks, subMonths, startOfDay, format } from 'date-fns';

export type DateRange = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last3months';

interface AnalyticsEvent {
  id: string;
  event_type: string;
  page_path: string | null;
  entity_id: string | null;
  entity_name: string | null;
  visitor_id: string;
  referrer: string | null;
  created_at: string;
}

interface DailyStats {
  date: string;
  visitors: number;
  pageViews: number;
  blogViews: number;
  productClicks: number;
}

interface TopContent {
  entity_id: string;
  entity_name: string;
  count: number;
}

export const getDateRangeStart = (range: DateRange): Date => {
  const now = new Date();
  switch (range) {
    case 'today':
      return startOfDay(now);
    case 'yesterday':
      return startOfDay(subDays(now, 1));
    case 'last7days':
      return startOfDay(subDays(now, 7));
    case 'last30days':
      return startOfDay(subDays(now, 30));
    case 'last3months':
      return startOfDay(subMonths(now, 3));
    default:
      return startOfDay(subDays(now, 7));
  }
};

export const useAnalyticsEvents = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['analytics-events', dateRange],
    queryFn: async () => {
      const startDate = getDateRangeStart(dateRange);
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AnalyticsEvent[];
    },
  });
};

export const useAnalyticsSummary = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['analytics-summary', dateRange],
    queryFn: async () => {
      const startDate = getDateRangeStart(dateRange);
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString());
      
      if (error) throw error;
      
      const events = data as AnalyticsEvent[];
      const uniqueVisitors = new Set(events.map(e => e.visitor_id)).size;
      const pageViews = events.filter(e => e.event_type === 'page_view').length;
      const blogViews = events.filter(e => e.event_type === 'blog_view').length;
      const productClicks = events.filter(e => e.event_type === 'product_click').length;
      
      return {
        uniqueVisitors,
        pageViews,
        blogViews,
        productClicks,
        totalEvents: events.length,
      };
    },
  });
};

export const useDailyAnalytics = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['analytics-daily', dateRange],
    queryFn: async () => {
      const startDate = getDateRangeStart(dateRange);
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const events = data as AnalyticsEvent[];
      const dailyMap = new Map<string, {
        visitors: Set<string>;
        pageViews: number;
        blogViews: number;
        productClicks: number;
      }>();
      
      events.forEach(event => {
        const date = format(new Date(event.created_at), 'yyyy-MM-dd');
        
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            visitors: new Set(),
            pageViews: 0,
            blogViews: 0,
            productClicks: 0,
          });
        }
        
        const dayData = dailyMap.get(date)!;
        dayData.visitors.add(event.visitor_id);
        
        if (event.event_type === 'page_view') dayData.pageViews++;
        if (event.event_type === 'blog_view') dayData.blogViews++;
        if (event.event_type === 'product_click') dayData.productClicks++;
      });
      
      const dailyStats: DailyStats[] = [];
      dailyMap.forEach((value, date) => {
        dailyStats.push({
          date,
          visitors: value.visitors.size,
          pageViews: value.pageViews,
          blogViews: value.blogViews,
          productClicks: value.productClicks,
        });
      });
      
      return dailyStats.sort((a, b) => a.date.localeCompare(b.date));
    },
  });
};

export const useTopBlogPosts = (dateRange: DateRange, limit = 5) => {
  return useQuery({
    queryKey: ['analytics-top-blogs', dateRange, limit],
    queryFn: async () => {
      const startDate = getDateRangeStart(dateRange);
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('entity_id, entity_name')
        .eq('event_type', 'blog_view')
        .gte('created_at', startDate.toISOString())
        .not('entity_id', 'is', null);
      
      if (error) throw error;
      
      const countMap = new Map<string, { name: string; count: number }>();
      
      (data as { entity_id: string; entity_name: string }[]).forEach(event => {
        const existing = countMap.get(event.entity_id);
        if (existing) {
          existing.count++;
        } else {
          countMap.set(event.entity_id, { name: event.entity_name || 'Unknown', count: 1 });
        }
      });
      
      const topContent: TopContent[] = [];
      countMap.forEach((value, key) => {
        topContent.push({ entity_id: key, entity_name: value.name, count: value.count });
      });
      
      return topContent.sort((a, b) => b.count - a.count).slice(0, limit);
    },
  });
};

export const useTopProducts = (dateRange: DateRange, limit = 5) => {
  return useQuery({
    queryKey: ['analytics-top-products', dateRange, limit],
    queryFn: async () => {
      const startDate = getDateRangeStart(dateRange);
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('entity_id, entity_name')
        .eq('event_type', 'product_click')
        .gte('created_at', startDate.toISOString())
        .not('entity_id', 'is', null);
      
      if (error) throw error;
      
      const countMap = new Map<string, { name: string; count: number }>();
      
      (data as { entity_id: string; entity_name: string }[]).forEach(event => {
        const existing = countMap.get(event.entity_id);
        if (existing) {
          existing.count++;
        } else {
          countMap.set(event.entity_id, { name: event.entity_name || 'Unknown', count: 1 });
        }
      });
      
      const topContent: TopContent[] = [];
      countMap.forEach((value, key) => {
        topContent.push({ entity_id: key, entity_name: value.name, count: value.count });
      });
      
      return topContent.sort((a, b) => b.count - a.count).slice(0, limit);
    },
  });
};

export const useTopPages = (dateRange: DateRange, limit = 5) => {
  return useQuery({
    queryKey: ['analytics-top-pages', dateRange, limit],
    queryFn: async () => {
      const startDate = getDateRangeStart(dateRange);
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('page_path')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate.toISOString())
        .not('page_path', 'is', null);
      
      if (error) throw error;
      
      const countMap = new Map<string, number>();
      
      (data as { page_path: string }[]).forEach(event => {
        countMap.set(event.page_path, (countMap.get(event.page_path) || 0) + 1);
      });
      
      const topPages: { path: string; count: number }[] = [];
      countMap.forEach((count, path) => {
        topPages.push({ path, count });
      });
      
      return topPages.sort((a, b) => b.count - a.count).slice(0, limit);
    },
  });
};
