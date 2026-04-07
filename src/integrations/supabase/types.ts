export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_name: string | null
          event_type: string
          id: string
          page_path: string | null
          referrer: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          event_type: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          event_type?: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          author_email: string
          author_name: string
          blog_post_id: string
          content: string
          created_at: string
          id: string
          is_approved: boolean
        }
        Insert: {
          author_email: string
          author_name: string
          blog_post_id: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
        }
        Update: {
          author_email?: string
          author_name?: string
          blog_post_id?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          created_by: string | null
          excerpt: string
          id: string
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          published: boolean
          read_time: string
          scheduled_for: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          excerpt: string
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          published?: boolean
          read_time?: string
          scheduled_for?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          published?: boolean
          read_time?: string
          scheduled_for?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      broken_links: {
        Row: {
          created_at: string
          id: string
          is_resolved: boolean | null
          last_checked: string
          source_id: string
          source_name: string | null
          source_type: string
          status_code: number | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          last_checked?: string
          source_id: string
          source_name?: string | null
          source_type: string
          status_code?: number | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          last_checked?: string
          source_id?: string
          source_name?: string | null
          source_type?: string
          status_code?: number | null
          url?: string
        }
        Relationships: []
      }
      commission_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          source: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          source?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          source?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      customer_photo_submissions: {
        Row: {
          caption: string | null
          created_at: string
          email: string
          id: string
          instagram_handle: string | null
          is_approved: boolean
          name: string
          photo_url: string
          room_type: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          email: string
          id?: string
          instagram_handle?: string | null
          is_approved?: boolean
          name: string
          photo_url: string
          room_type?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          email?: string
          id?: string
          instagram_handle?: string | null
          is_approved?: boolean
          name?: string
          photo_url?: string
          room_type?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      ownership_transfers: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_owner_confirmed: boolean | null
          current_owner_id: string
          expires_at: string
          id: string
          new_owner_confirmed: boolean | null
          new_owner_email: string
          token: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_owner_confirmed?: boolean | null
          current_owner_id: string
          expires_at?: string
          id?: string
          new_owner_confirmed?: boolean | null
          new_owner_email: string
          token?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_owner_confirmed?: boolean | null
          current_owner_id?: string
          expires_at?: string
          id?: string
          new_owner_confirmed?: boolean | null
          new_owner_email?: string
          token?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      product_category_assignments: {
        Row: {
          category_slug: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          category_slug: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          category_slug?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_category_assignments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          media_type: string
          media_url: string
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          media_type?: string
          media_url: string
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          media_type?: string
          media_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string
          id: string
          product_id: string
          rating: number
          review_text: string | null
          reviewer_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          rating: number
          review_text?: string | null
          reviewer_name: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          review_text?: string | null
          reviewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_url: string
          badge: string | null
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          og_image_url: string | null
          original_price: string | null
          price: string
          rating: number | null
          reviews: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          affiliate_url: string
          badge?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          og_image_url?: string | null
          original_price?: string | null
          price: string
          rating?: number | null
          reviews?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          badge?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          og_image_url?: string | null
          original_price?: string | null
          price?: string
          rating?: number | null
          reviews?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          two_factor_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seasonal_banners: {
        Row: {
          badge_text: string | null
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          end_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          priority: number | null
          start_date: string
          subtitle: string | null
          title: string
        }
        Insert: {
          badge_text?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          start_date: string
          subtitle?: string | null
          title: string
        }
        Update: {
          badge_text?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          start_date?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          device_info: Json | null
          event_type: string
          id: string
          ip_address: string | null
          is_new_device: boolean | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          is_new_device?: boolean | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          is_new_device?: boolean | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          last_login: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_login?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_login?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "super_admin"
        | "editor"
        | "writer"
        | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "super_admin", "editor", "writer", "viewer"],
    },
  },
} as const
