import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NewsletterPopupSettings {
  enabled: boolean;
  delay_seconds: number;
  scroll_threshold: number;
  expiry_days: number;
}

export const DEFAULT_NEWSLETTER_SETTINGS: NewsletterPopupSettings = {
  enabled: true,
  delay_seconds: 30,
  scroll_threshold: 60,
  expiry_days: 7,
};

export const useNewsletterSettings = () => {
  return useQuery({
    queryKey: ['newsletter-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'newsletter_popup')
        .maybeSingle();
      
      if (error) throw error;
      
      if (data?.value) {
        return {
          ...DEFAULT_NEWSLETTER_SETTINGS,
          ...(data.value as Partial<NewsletterPopupSettings>),
        };
      }
      
      return DEFAULT_NEWSLETTER_SETTINGS;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
