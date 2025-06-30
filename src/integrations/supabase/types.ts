export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_applications: {
        Row: {
          discord: string
          id: string
          ip_address: string
          requested_role: Database["public"]["Enums"]["admin_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          secret_key: string
          status: Database["public"]["Enums"]["application_status"] | null
          submitted_at: string | null
        }
        Insert: {
          discord: string
          id?: string
          ip_address: string
          requested_role: Database["public"]["Enums"]["admin_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          secret_key: string
          status?: Database["public"]["Enums"]["application_status"] | null
          submitted_at?: string | null
        }
        Update: {
          discord?: string
          id?: string
          ip_address?: string
          requested_role?: Database["public"]["Enums"]["admin_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          secret_key?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          approved_at: string | null
          approved_by: string
          id: string
          ip_address: string
          last_access: string | null
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          approved_at?: string | null
          approved_by: string
          id?: string
          ip_address: string
          last_access?: string | null
          role: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string
          id?: string
          ip_address?: string
          last_access?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: []
      }
      auth_config: {
        Row: {
          config_key: string
          config_value: string
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      banned_players: {
        Row: {
          banned_at: string
          id: string
          ign: string
          player_id: string
          reason: string | null
        }
        Insert: {
          banned_at?: string
          id?: string
          ign: string
          player_id: string
          reason?: string | null
        }
        Update: {
          banned_at?: string
          id?: string
          ign?: string
          player_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banned_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      gamemode_scores: {
        Row: {
          created_at: string
          display_tier: Database["public"]["Enums"]["tier_level"]
          gamemode: Database["public"]["Enums"]["game_mode"]
          id: string
          internal_tier: Database["public"]["Enums"]["tier_level"]
          player_id: string
          score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_tier: Database["public"]["Enums"]["tier_level"]
          gamemode: Database["public"]["Enums"]["game_mode"]
          id?: string
          internal_tier: Database["public"]["Enums"]["tier_level"]
          player_id: string
          score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_tier?: Database["public"]["Enums"]["tier_level"]
          gamemode?: Database["public"]["Enums"]["game_mode"]
          id?: string
          internal_tier?: Database["public"]["Enums"]["tier_level"]
          player_id?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamemode_scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          avatar_url: string | null
          banned: boolean
          created_at: string
          device: Database["public"]["Enums"]["device_type"] | null
          global_points: number
          id: string
          ign: string
          java_username: string | null
          overall_rank: number | null
          region: Database["public"]["Enums"]["player_region"] | null
          updated_at: string
          uuid: string | null
        }
        Insert: {
          avatar_url?: string | null
          banned?: boolean
          created_at?: string
          device?: Database["public"]["Enums"]["device_type"] | null
          global_points?: number
          id?: string
          ign: string
          java_username?: string | null
          overall_rank?: number | null
          region?: Database["public"]["Enums"]["player_region"] | null
          updated_at?: string
          uuid?: string | null
        }
        Update: {
          avatar_url?: string | null
          banned?: boolean
          created_at?: string
          device?: Database["public"]["Enums"]["device_type"] | null
          global_points?: number
          id?: string
          ign?: string
          java_username?: string | null
          overall_rank?: number | null
          region?: Database["public"]["Enums"]["player_region"] | null
          updated_at?: string
          uuid?: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          level: Database["public"]["Enums"]["log_level"]
          message: string
          operation: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          level: Database["public"]["Enums"]["log_level"]
          message: string
          operation?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          level?: Database["public"]["Enums"]["log_level"]
          message?: string
          operation?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_ban_player: {
        Args: { player_id: string; player_ign: string }
        Returns: undefined
      }
      admin_delete_player: {
        Args: { player_id: string }
        Returns: undefined
      }
      admin_update_global_points: {
        Args: { player_id: string }
        Returns: undefined
      }
      calculate_tier_points: {
        Args: { tier: Database["public"]["Enums"]["tier_level"] }
        Returns: number
      }
      check_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          has_access: boolean
          user_role: Database["public"]["Enums"]["admin_role"]
        }[]
      }
      check_user_auth: {
        Args: { required_role?: string }
        Returns: boolean
      }
      generate_security_checksum: {
        Args: { player_data: Json }
        Returns: string
      }
      get_client_ip: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_players_by_gamemode: {
        Args: { game_mode_param: Database["public"]["Enums"]["game_mode"] }
        Returns: {
          id: string
          ign: string
          java_username: string
          uuid: string
          avatar_url: string
          region: Database["public"]["Enums"]["player_region"]
          device: Database["public"]["Enums"]["device_type"]
          global_points: number
          tier: Database["public"]["Enums"]["tier_level"]
          score: number
          banned: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_ranked_players: {
        Args: { limit_count?: number }
        Returns: {
          id: string
          ign: string
          java_username: string
          uuid: string
          avatar_url: string
          region: Database["public"]["Enums"]["player_region"]
          device: Database["public"]["Enums"]["device_type"]
          global_points: number
          overall_rank: number
          banned: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_user_ip: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      recalculate_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_leaderboard_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      verify_admin_pin: {
        Args: { input_pin: string }
        Returns: {
          admin_id: string
          session_token: string
        }[]
      }
    }
    Enums: {
      admin_role: "owner" | "admin" | "moderator" | "tester"
      application_status: "pending" | "approved" | "denied"
      device_type: "PC" | "Mobile" | "Console"
      game_mode:
        | "Crystal"
        | "Sword"
        | "SMP"
        | "UHC"
        | "Axe"
        | "NethPot"
        | "Bedwars"
        | "Mace"
      log_level: "info" | "warn" | "error" | "debug"
      player_region: "NA" | "EU" | "ASIA" | "OCE" | "SA" | "AF"
      tier_level:
        | "LT5"
        | "HT5"
        | "LT4"
        | "HT4"
        | "LT3"
        | "HT3"
        | "LT2"
        | "HT2"
        | "LT1"
        | "HT1"
        | "Retired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["owner", "admin", "moderator", "tester"],
      application_status: ["pending", "approved", "denied"],
      device_type: ["PC", "Mobile", "Console"],
      game_mode: [
        "Crystal",
        "Sword",
        "SMP",
        "UHC",
        "Axe",
        "NethPot",
        "Bedwars",
        "Mace",
      ],
      log_level: ["info", "warn", "error", "debug"],
      player_region: ["NA", "EU", "ASIA", "OCE", "SA", "AF"],
      tier_level: [
        "LT5",
        "HT5",
        "LT4",
        "HT4",
        "LT3",
        "HT3",
        "LT2",
        "HT2",
        "LT1",
        "HT1",
        "Retired",
      ],
    },
  },
} as const
