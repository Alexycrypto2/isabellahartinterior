import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  pinterest?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
}

// Fetch social media settings (public)
export const useSocialSettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'social_media'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'social_media')
        .maybeSingle();
      
      if (error) throw error;
      return (data?.value as SocialLinks) || {};
    },
  });
};
