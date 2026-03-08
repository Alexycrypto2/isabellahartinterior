import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';
import { supabase } from '@/integrations/supabase/client';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't track page views for authenticated (admin) users
    const checkAndTrack = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is logged in, they're an admin — skip tracking
      if (session?.user) return;
      
      // Also skip tracking for admin routes
      if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/auth')) return;
      
      trackPageView(location.pathname);
    };
    
    checkAndTrack();
  }, [location.pathname]);

  return null;
};

export default AnalyticsTracker;
