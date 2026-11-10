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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          id: number
          new_data: Json | null
          old_data: Json | null
          owner_id: string
          row_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          owner_id: string
          row_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          owner_id?: string
          row_id?: string
          table_name?: string
        }
        Relationships: []
      }
      blocks: {
        Row: {
          court_id: string
          created_at: string
          created_by: string | null
          id: string
          owner_id: string
          reason: string | null
          time_range: unknown
        }
        Insert: {
          court_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          owner_id: string
          reason?: string | null
          time_range: unknown
        }
        Update: {
          court_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          owner_id?: string
          reason?: string | null
          time_range?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "blocks_court_id_owner_id_fkey"
            columns: ["court_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      bookings: {
        Row: {
          cancel_reason: string | null
          court_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          hold_expires_at: string | null
          id: string
          notes: string | null
          owner_id: string
          payment_proof_url: string | null
          price: number
          price_overridden: boolean
          source: Database["public"]["Enums"]["booking_source"]
          status: Database["public"]["Enums"]["booking_status"]
          time_range: unknown
          updated_at: string
        }
        Insert: {
          cancel_reason?: string | null
          court_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          hold_expires_at?: string | null
          id?: string
          notes?: string | null
          owner_id: string
          payment_proof_url?: string | null
          price?: number
          price_overridden?: boolean
          source?: Database["public"]["Enums"]["booking_source"]
          status?: Database["public"]["Enums"]["booking_status"]
          time_range: unknown
          updated_at?: string
        }
        Update: {
          cancel_reason?: string | null
          court_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          hold_expires_at?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          payment_proof_url?: string | null
          price?: number
          price_overridden?: boolean
          source?: Database["public"]["Enums"]["booking_source"]
          status?: Database["public"]["Enums"]["booking_status"]
          time_range?: unknown
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_court_id_owner_id_fkey"
            columns: ["court_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id", "owner_id"]
          },
          {
            foreignKeyName: "bookings_customer_id_owner_id_fkey"
            columns: ["customer_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      court_occupancy: {
        Row: {
          block_id: string | null
          booking_id: string | null
          court_id: string
          id: string
          owner_id: string
          time_range: unknown
        }
        Insert: {
          block_id?: string | null
          booking_id?: string | null
          court_id: string
          id?: string
          owner_id: string
          time_range: unknown
        }
        Update: {
          block_id?: string | null
          booking_id?: string | null
          court_id?: string
          id?: string
          owner_id?: string
          time_range?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "court_occupancy_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: true
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_occupancy_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_occupancy_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          active: boolean
          base_price: number
          close_time: string
          id: string
          name: string
          open_time: string
          owner_id: string
          slot_minutes: number
          sport: string | null
          turf_id: string
        }
        Insert: {
          active?: boolean
          base_price?: number
          close_time?: string
          id?: string
          name: string
          open_time?: string
          owner_id: string
          slot_minutes?: number
          sport?: string | null
          turf_id: string
        }
        Update: {
          active?: boolean
          base_price?: number
          close_time?: string
          id?: string
          name?: string
          open_time?: string
          owner_id?: string
          slot_minutes?: number
          sport?: string | null
          turf_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courts_turf_id_owner_id_fkey"
            columns: ["turf_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "turfs"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          owner_id: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          owner_id: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          email: string | null
          id: string
          owner_id: string
          phone: string | null
          role: string
          user_id: string
        }
        Insert: {
          email?: string | null
          id?: string
          owner_id: string
          phone?: string | null
          role?: string
          user_id: string
        }
        Update: {
          email?: string | null
          id?: string
          owner_id?: string
          phone?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
          status: Database["public"]["Enums"]["owner_status"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["owner_status"]
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["owner_status"]
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          id: string
          mode: Database["public"]["Enums"]["payment_mode"]
          owner_id: string
          paid_at: string
          recorded_by: string | null
          type: Database["public"]["Enums"]["payment_type"]
        }
        Insert: {
          amount: number
          booking_id: string
          id?: string
          mode: Database["public"]["Enums"]["payment_mode"]
          owner_id: string
          paid_at?: string
          recorded_by?: string | null
          type: Database["public"]["Enums"]["payment_type"]
        }
        Update: {
          amount?: number
          booking_id?: string
          id?: string
          mode?: Database["public"]["Enums"]["payment_mode"]
          owner_id?: string
          paid_at?: string
          recorded_by?: string | null
          type?: Database["public"]["Enums"]["payment_type"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_owner_id_fkey"
            columns: ["booking_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      price_bands: {
        Row: {
          court_id: string
          days_of_week: number[]
          end_time: string
          id: string
          owner_id: string
          price: number
          start_time: string
          tag: string | null
          whatsapp_bookable: boolean
        }
        Insert: {
          court_id: string
          days_of_week?: number[]
          end_time: string
          id?: string
          owner_id: string
          price: number
          start_time: string
          tag?: string | null
          whatsapp_bookable?: boolean
        }
        Update: {
          court_id?: string
          days_of_week?: number[]
          end_time?: string
          id?: string
          owner_id?: string
          price?: number
          start_time?: string
          tag?: string | null
          whatsapp_bookable?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "price_bands_court_id_owner_id_fkey"
            columns: ["court_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      super_admins: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
        Relationships: []
      }
      turfs: {
        Row: {
          address: string | null
          advance_type: string
          advance_value: number
          approval_mode: boolean
          booking_code: string | null
          cancellation_policy: string | null
          created_at: string
          hold_minutes: number
          id: string
          maps_link: string | null
          name: string
          owner_id: string
          reminder_hours: number
          summary_time: string
          upi_id: string | null
          upi_qr_url: string | null
        }
        Insert: {
          address?: string | null
          advance_type?: string
          advance_value?: number
          approval_mode?: boolean
          booking_code?: string | null
          cancellation_policy?: string | null
          created_at?: string
          hold_minutes?: number
          id?: string
          maps_link?: string | null
          name: string
          owner_id: string
          reminder_hours?: number
          summary_time?: string
          upi_id?: string | null
          upi_qr_url?: string | null
        }
        Update: {
          address?: string | null
          advance_type?: string
          advance_value?: number
          approval_mode?: boolean
          booking_code?: string | null
          cancellation_policy?: string | null
          created_at?: string
          hold_minutes?: number
          id?: string
          maps_link?: string | null
          name?: string
          owner_id?: string
          reminder_hours?: number
          summary_time?: string
          upi_id?: string | null
          upi_qr_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turfs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_source: "phone" | "walk_in" | "whatsapp" | "other_app"
      booking_status:
        | "pending_payment"
        | "confirmed"
        | "checked_in"
        | "completed"
        | "cancelled"
        | "rejected"
        | "expired"
        | "no_show"
      owner_status: "active" | "inactive"
      payment_mode: "cash" | "upi"
      payment_type: "advance" | "balance" | "refund"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_source: ["phone", "walk_in", "whatsapp", "other_app"],
      booking_status: [
        "pending_payment",
        "confirmed",
        "checked_in",
        "completed",
        "cancelled",
        "rejected",
        "expired",
        "no_show",
      ],
      owner_status: ["active", "inactive"],
      payment_mode: ["cash", "upi"],
      payment_type: ["advance", "balance", "refund"],
    },
  },
} as const
