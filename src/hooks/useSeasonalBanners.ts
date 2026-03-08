import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SeasonalBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string;
  cta_link: string;
  badge_text: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  priority: number;
  created_at: string;
}

export const useActiveSeasonalBanner = () => {
  return useQuery({
    queryKey: ['seasonal-banners', 'active'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('seasonal_banners')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('priority', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as SeasonalBanner | null;
    },
  });
};

export const useAllSeasonalBanners = () => {
  return useQuery({
    queryKey: ['seasonal-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasonal_banners')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as SeasonalBanner[];
    },
  });
};

export const useCreateSeasonalBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (banner: Omit<SeasonalBanner, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('seasonal_banners')
        .insert(banner)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seasonal-banners'] }),
  });
};

export const useUpdateSeasonalBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SeasonalBanner> & { id: string }) => {
      const { data, error } = await supabase
        .from('seasonal_banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seasonal-banners'] }),
  });
};

export const useDeleteSeasonalBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('seasonal_banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seasonal-banners'] }),
  });
};
