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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      checkins: {
        Row: {
          breach_explanation: string | null
          checkin_date: string
          checkin_id: string
          completion_time: string | null
          created_at: string
          lane_id: string
          status: string
          user_id: string
        }
        Insert: {
          breach_explanation?: string | null
          checkin_date?: string
          checkin_id?: string
          completion_time?: string | null
          created_at?: string
          lane_id: string
          status?: string
          user_id: string
        }
        Update: {
          breach_explanation?: string | null
          checkin_date?: string
          checkin_id?: string
          completion_time?: string | null
          created_at?: string
          lane_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_lane_id_fkey"
            columns: ["lane_id"]
            isOneToOne: false
            referencedRelation: "lanes"
            referencedColumns: ["lane_id"]
          },
          {
            foreignKeyName: "checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      encouragements: {
        Row: {
          body: string
          created_at: string
          id: string
          lane_id: string
          owner_id: string
          read_at: string | null
          watchman_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          lane_id: string
          owner_id: string
          read_at?: string | null
          watchman_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          lane_id?: string
          owner_id?: string
          read_at?: string | null
          watchman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encouragements_lane_id_fkey"
            columns: ["lane_id"]
            isOneToOne: false
            referencedRelation: "lanes"
            referencedColumns: ["lane_id"]
          },
        ]
      }
      lane_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          expires_at: string
          invite_id: string
          lane_id: string
          owner_id: string
          relationship: string | null
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          expires_at?: string
          invite_id?: string
          lane_id: string
          owner_id: string
          relationship?: string | null
          status?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          expires_at?: string
          invite_id?: string
          lane_id?: string
          owner_id?: string
          relationship?: string | null
          status?: string
          token?: string
        }
        Relationships: []
      }
      lanes: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          lane_id: string
          lane_type: string
          notes: string | null
          partner_email: string | null
          partner_id: string | null
          partner_relationship: string | null
          status: string
          support_scripture: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          lane_id?: string
          lane_type?: string
          notes?: string | null
          partner_email?: string | null
          partner_id?: string | null
          partner_relationship?: string | null
          status?: string
          support_scripture?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          lane_id?: string
          lane_type?: string
          notes?: string | null
          partner_email?: string | null
          partner_id?: string | null
          partner_relationship?: string | null
          status?: string
          support_scripture?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lanes_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lanes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: string | null
          checkin_id: string | null
          created_at: string
          lane_id: string
          message_content: string | null
          notification_id: string
          partner_id: string
          sent_at: string | null
          status: string
          type: string
        }
        Insert: {
          channel?: string | null
          checkin_id?: string | null
          created_at?: string
          lane_id: string
          message_content?: string | null
          notification_id?: string
          partner_id: string
          sent_at?: string | null
          status?: string
          type: string
        }
        Update: {
          channel?: string | null
          checkin_id?: string | null
          created_at?: string
          lane_id?: string
          message_content?: string | null
          notification_id?: string
          partner_id?: string
          sent_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "checkins"
            referencedColumns: ["checkin_id"]
          },
          {
            foreignKeyName: "notifications_lane_id_fkey"
            columns: ["lane_id"]
            isOneToOne: false
            referencedRelation: "lanes"
            referencedColumns: ["lane_id"]
          },
          {
            foreignKeyName: "notifications_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      path_watchmen: {
        Row: {
          created_at: string
          id: string
          path_id: string
          relationship: string | null
          status: string
          watchman_email: string
          watchman_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path_id: string
          relationship?: string | null
          status?: string
          watchman_email: string
          watchman_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path_id?: string
          relationship?: string | null
          status?: string
          watchman_email?: string
          watchman_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "path_watchmen_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "lanes"
            referencedColumns: ["lane_id"]
          },
          {
            foreignKeyName: "path_watchmen_watchman_id_fkey"
            columns: ["watchman_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          bedtime: string
          created_at: string
          dismissed_watchman_prompt: boolean
          email: string
          first_name: string | null
          gender: string | null
          last_active: string | null
          last_name: string | null
          phone: string | null
          reminder_utc_hour: number | null
          status: string
          timezone: string
          trial_ends_at: string | null
          user_id: string
        }
        Insert: {
          bedtime?: string
          created_at?: string
          dismissed_watchman_prompt?: boolean
          email: string
          first_name?: string | null
          gender?: string | null
          last_active?: string | null
          last_name?: string | null
          phone?: string | null
          reminder_utc_hour?: number | null
          status?: string
          timezone?: string
          trial_ends_at?: string | null
          user_id: string
        }
        Update: {
          bedtime?: string
          created_at?: string
          dismissed_watchman_prompt?: boolean
          email?: string
          first_name?: string | null
          gender?: string | null
          last_active?: string | null
          last_name?: string | null
          phone?: string | null
          reminder_utc_hour?: number | null
          status?: string
          timezone?: string
          trial_ends_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referrals: {
        Row: {
          claimed_at: string | null
          code: string
          created_at: string
          id: string
          referred_user_id: string | null
          referrer_id: string
        }
        Insert: {
          claimed_at?: string | null
          code: string
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id: string
        }
        Update: {
          claimed_at?: string | null
          code?: string
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_invite_preview: {
        Args: { _token: string }
        Returns: {
          expired: boolean
          lane_title: string
          owner_email: string
          owner_first_name: string
          status: string
        }[]
      }
      has_access: { Args: { _user_id: string }; Returns: boolean }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
