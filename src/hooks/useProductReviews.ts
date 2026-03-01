import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductReview {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ProductReview[];
    },
    enabled: !!productId,
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (review: {
      product_id: string;
      reviewer_name: string;
      rating: number;
      review_text?: string;
    }) => {
      const { data, error } = await supabase
        .from("product_reviews")
        .insert({
          product_id: review.product_id,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          review_text: review.review_text || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.product_id] });
    },
  });
};
