import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  original_price: string | null;
  category: string;
  image_url: string | null;
  affiliate_url: string;
  rating: number;
  reviews: number;
  badge: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
}

export interface ProductInput {
  name: string;
  slug: string;
  description: string;
  price: string;
  original_price?: string | null;
  category: string;
  image_url?: string | null;
  affiliate_url: string;
  rating?: number;
  reviews?: number;
  badge?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
  created_at: string;
}

// Helper to log activity
const logActivity = async (
  action: string,
  entityType: string,
  entityId?: string,
  entityName?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('activity_logs').insert([{
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      entity_name: entityName || null,
      user_id: user?.id || null,
    }]);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Fetch all active products (public)
export const useActiveProducts = () => {
  return useQuery({
    queryKey: ['products', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    },
  });
};

// Fetch all products (admin)
export const useAllProducts = () => {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    },
  });
};

// Fetch single product by ID
export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ['products', 'id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
};

// Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: ProductInput) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      logActivity('Product created', 'product', data.id, data.name);
    },
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: ProductInput & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      logActivity('Product updated', 'product', data.id, data.name);
    },
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First get the product name for logging
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, name: product?.name };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      logActivity('Product deleted', 'product', data.id, data.name);
    },
  });
};

// Toggle product active status
export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      const action = data.is_active ? 'Product activated' : 'Product deactivated';
      logActivity(action, 'product', data.id, data.name);
    },
  });
};

// Fetch product categories
export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as ProductCategory[];
    },
  });
};

// Create product category
export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: { name: string; slug: string; icon?: string }) => {
      const { data, error } = await supabase
        .from('product_categories')
        .insert(category)
        .select()
        .single();
      
      if (error) throw error;
      return data as ProductCategory;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      logActivity('Category created', 'product_category', data.id, data.name);
    },
  });
};

// Update product category
export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...category }: { id: string; name: string; slug: string; icon?: string }) => {
      const { data, error } = await supabase
        .from('product_categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ProductCategory;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      logActivity('Category updated', 'product_category', data.id, data.name);
    },
  });
};

// Delete product category
export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First get the category name for logging
      const { data: category } = await supabase
        .from('product_categories')
        .select('name')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, name: category?.name };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      logActivity('Category deleted', 'product_category', data.id, data.name);
    },
  });
};
