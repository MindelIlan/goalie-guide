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
      goal_folders: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          description: string | null
          folder_id: number | null
          id: number
          progress: number | null
          tags: string[] | null
          target_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          folder_id?: number | null
          id?: number
          progress?: number | null
          tags?: string[] | null
          target_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          folder_id?: number | null
          id?: number
          progress?: number | null
          tags?: string[] | null
          target_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "goal_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          message: string | null
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          message?: string | null
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          message?: string | null
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          email: string | null
          has_completed_tour: boolean | null
          id: string
          openai_api_key: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          has_completed_tour?: boolean | null
          id: string
          openai_api_key?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          has_completed_tour?: boolean | null
          id?: string
          openai_api_key?: string | null
          username?: string | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string
          id: number
          name: string
          secret: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          secret: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          secret?: string
        }
        Relationships: []
      }
      shared_goals: {
        Row: {
          created_at: string
          goal_id: number | null
          id: number
          shared_by: string | null
          shared_with: string | null
        }
        Insert: {
          created_at?: string
          goal_id?: number | null
          id?: number
          shared_by?: string | null
          shared_with?: string | null
        }
        Update: {
          created_at?: string
          goal_id?: number | null
          id?: number
          shared_by?: string | null
          shared_with?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_goals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      subgoals: {
        Row: {
          completed: boolean | null
          created_at: string
          goal_id: number | null
          id: number
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          goal_id?: number | null
          id?: number
          title: string
          user_id?: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          goal_id?: number | null
          id?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subgoals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      Userlist: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_profile_goals_folder: {
        Args: {
          user_id_param: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
