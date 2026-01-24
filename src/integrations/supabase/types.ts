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
      actions: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          event_id: string | null
          id: string
          user_id: string
          visitor_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          event_id?: string | null
          id?: string
          user_id: string
          visitor_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          event_id?: string | null
          id?: string
          user_id?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      door_status: {
        Row: {
          id: string
          is_locked: boolean
          last_updated: string
          user_id: string
        }
        Insert: {
          id?: string
          is_locked?: boolean
          last_updated?: string
          user_id: string
        }
        Update: {
          id?: string
          is_locked?: boolean
          last_updated?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          entry_point: string
          event_type: string
          id: string
          is_demo: boolean
          snapshot_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_point?: string
          event_type?: string
          id?: string
          is_demo?: boolean
          snapshot_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          entry_point?: string
          event_type?: string
          id?: string
          is_demo?: boolean
          snapshot_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alerts_enabled: boolean
          created_at: string
          dark_mode: boolean
          demo_mode_enabled: boolean
          email: string | null
          home_address: string | null
          id: string
          name: string | null
          phone_number: string | null
          pin_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alerts_enabled?: boolean
          created_at?: string
          dark_mode?: boolean
          demo_mode_enabled?: boolean
          email?: string | null
          home_address?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
          pin_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alerts_enabled?: boolean
          created_at?: string
          dark_mode?: boolean
          demo_mode_enabled?: boolean
          email?: string | null
          home_address?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
          pin_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trusted_contacts: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          name: string
          phone_number: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          name: string
          phone_number: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          name?: string
          phone_number?: string
          user_id?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          created_at: string
          detected_at: string
          entry_point: string
          id: string
          snapshot_url: string | null
          status: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          detected_at?: string
          entry_point?: string
          id?: string
          snapshot_url?: string | null
          status?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          detected_at?: string
          entry_point?: string
          id?: string
          snapshot_url?: string | null
          status?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
