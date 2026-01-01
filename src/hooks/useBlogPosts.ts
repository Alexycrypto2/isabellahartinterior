import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image_url: string | null;
  read_time: string;
  published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image_url?: string | null;
  read_time: string;
  published: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
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

// Fetch all published blog posts (public)
export const usePublishedBlogPosts = () => {
  return useQuery({
    queryKey: ['blog-posts', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

// Fetch all blog posts (admin only)
export const useAllBlogPosts = () => {
  return useQuery({
    queryKey: ['blog-posts', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

// Fetch single blog post by slug (public)
export const useBlogPostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['blog-posts', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
  });
};

// Fetch single blog post by ID (admin)
export const useBlogPostById = (id: string) => {
  return useQuery({
    queryKey: ['blog-posts', 'id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id,
  });
};

// Create blog post
export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (post: BlogPostInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...post,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      logActivity('Blog post created', 'blog_post', data.id, data.title);
    },
  });
};

// Update blog post
export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...post }: BlogPostInput & { id: string }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(post)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      logActivity('Blog post updated', 'blog_post', data.id, data.title);
    },
  });
};

// Delete blog post
export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First get the post title for logging
      const { data: post } = await supabase
        .from('blog_posts')
        .select('title')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, title: post?.title };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      logActivity('Blog post deleted', 'blog_post', data.id, data.title);
    },
  });
};

// Toggle publish status
export const useTogglePublishStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({ published })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      const action = data.published ? 'Blog post published' : 'Blog post unpublished';
      logActivity(action, 'blog_post', data.id, data.title);
    },
  });
};
