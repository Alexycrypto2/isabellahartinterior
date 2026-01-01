import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  details: Json | null;
  created_at: string | null;
}

// Fetch recent activity logs (admin)
export const useActivityLogs = (limit: number = 20) => {
  return useQuery({
    queryKey: ['activity-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as ActivityLog[];
    },
  });
};

// Log an activity (admin)
export const useLogActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (log: {
      action: string;
      entity_type: string;
      entity_id?: string;
      entity_name?: string;
      details?: Json;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const logEntry = {
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id || null,
        entity_name: log.entity_name || null,
        details: log.details || null,
        user_id: user?.id || null,
      };
      
      const { data, error } = await supabase
        .from('activity_logs')
        .insert([logEntry])
        .select()
        .single();
      
      if (error) throw error;
      return data as ActivityLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
  });
};
