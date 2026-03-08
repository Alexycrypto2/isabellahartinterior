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

/** Check if the current user is an authenticated admin */
const isAdminUser = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch {
    return false;
  }
};

interface TrackEventOptions {
  eventType: 'page_view' | 'blog_view' | 'product_click';
  pagePath?: string;
  entityId?: string;
  entityName?: string;
  /** Optional metadata stored in referrer field (e.g. UTM source info) */
  metadata?: string;
}

export const trackEvent = async (options: TrackEventOptions): Promise<void> => {
  try {
    // Skip tracking for logged-in admin users (your own views)
    const isAdmin = await isAdminUser();
    if (isAdmin) return;

    // Skip admin/auth routes
    const path = options.pagePath || window.location.pathname;
    if (path.startsWith('/admin') || path.startsWith('/auth')) return;

    const visitorId = getVisitorId();
    
    await supabase.from('analytics_events').insert({
      event_type: options.eventType,
      page_path: path,
      entity_id: options.entityId || null,
      entity_name: options.entityName || null,
      visitor_id: visitorId,
      referrer: options.metadata || document.referrer || null,
      user_agent: navigator.userAgent?.substring(0, 500) || null,
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

/**
 * Track a product affiliate click with UTM source context.
 */
export const trackProductClick = (productId: string, productName: string, utmSource?: string, utmMedium?: string) => {
  const source = utmSource || detectUtmSource();
  const medium = utmMedium || detectUtmMedium();
  
  trackEvent({
    eventType: 'product_click',
    pagePath: window.location.pathname,
    entityId: productId,
    entityName: productName,
    metadata: `utm_source=${source}|utm_medium=${medium}`,
  });
};

/** Detect UTM source from the current page path */
function detectUtmSource(): string {
  const path = window.location.pathname;
  if (path === '/') return 'homepage';
  if (path.startsWith('/shop')) return 'shop';
  if (path.startsWith('/blog')) return 'blog';
  if (path.startsWith('/cart')) return 'cart';
  if (path.startsWith('/inspiration')) return 'ai-stylist';
  return path.replace(/^\//, '').split('/')[0] || 'unknown';
}

/** Detect UTM medium from the current page context */
function detectUtmMedium(): string {
  return 'product-link';
}
