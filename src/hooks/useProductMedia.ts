import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductMedia {
  id: string;
  product_id: string;
  media_url: string;
  media_type: string;
  display_order: number;
  alt_text: string | null;
  created_at: string;
}

export const useProductMedia = (productId: string) => {
  return useQuery({
    queryKey: ['product-media', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_media')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as ProductMedia[];
    },
    enabled: !!productId,
  });
};

export const useAddProductMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (media: {
      product_id: string;
      media_url: string;
      media_type: string;
      display_order: number;
      alt_text?: string;
    }) => {
      const { data, error } = await supabase
        .from('product_media')
        .insert(media)
        .select()
        .single();

      if (error) throw error;
      return data as ProductMedia;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-media', data.product_id] });
    },
  });
};

export const useDeleteProductMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase
        .from('product_media')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, productId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-media', data.productId] });
    },
  });
};

export const useReorderProductMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items }: { items: { id: string; display_order: number; product_id: string }[] }) => {
      const promises = items.map((item) =>
        supabase
          .from('product_media')
          .update({ display_order: item.display_order })
          .eq('id', item.id)
      );
      await Promise.all(promises);
      return items[0]?.product_id;
    },
    onSuccess: (productId) => {
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ['product-media', productId] });
      }
    },
  });
};
