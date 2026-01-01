import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, any>;
  updated_at: string;
}

// Fetch all site settings
export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) throw error;
      
      // Convert to a key-value map for easier access
      const settingsMap: Record<string, Record<string, any>> = {};
      (data as SiteSetting[]).forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });
      
      return settingsMap;
    },
  });
};

// Fetch single setting by key
export const useSiteSetting = (key: string) => {
  return useQuery({
    queryKey: ['site-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', key)
        .single();
      
      if (error) throw error;
      return data as SiteSetting;
    },
    enabled: !!key,
  });
};

// Update site setting
export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ value })
        .eq('key', key)
        .select()
        .single();
      
      if (error) throw error;
      return data as SiteSetting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
};

// Upsert site setting (create or update)
export const useUpsertSiteSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({ key, value }, { onConflict: 'key' })
        .select()
        .single();
      
      if (error) throw error;
      return data as SiteSetting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
};
