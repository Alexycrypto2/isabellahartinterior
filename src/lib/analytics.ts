import { supabase } from '@/integrations/supabase/client';

// Generate or retrieve a persistent visitor ID
const getVisitorId = (): string => {
  const storageKey = 'visitor_id';
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
};

interface TrackEventOptions {
  eventType: 'page_view' | 'blog_view' | 'product_click';
  pagePath?: string;
  entityId?: string;
  entityName?: string;
}

export const trackEvent = async (options: TrackEventOptions): Promise<void> => {
  try {
    const visitorId = getVisitorId();
    
    await supabase.from('analytics_events').insert({
      event_type: options.eventType,
      page_path: options.pagePath || window.location.pathname,
      entity_id: options.entityId || null,
      entity_name: options.entityName || null,
      visitor_id: visitorId,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    // Silently fail - don't break the app for analytics
    console.error('Analytics tracking error:', error);
  }
};

export const trackPageView = (pagePath?: string) => {
  trackEvent({
    eventType: 'page_view',
    pagePath: pagePath || window.location.pathname,
  });
};

export const trackBlogView = (blogId: string, blogTitle: string) => {
  trackEvent({
    eventType: 'blog_view',
    pagePath: window.location.pathname,
    entityId: blogId,
    entityName: blogTitle,
  });
};

export const trackProductClick = (productId: string, productName: string) => {
  trackEvent({
    eventType: 'product_click',
    pagePath: window.location.pathname,
    entityId: productId,
    entityName: productName,
  });
};
