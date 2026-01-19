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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      daily_forecasts: {
        Row: {
          created_at: string
          id: string
          predicted_qty: number
          product_code: number
          product_name: string
          status: string
          suggested_order: number
          trend_data: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          predicted_qty?: number
          product_code: number
          product_name: string
          status?: string
          suggested_order?: number
          trend_data?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          predicted_qty?: number
          product_code?: number
          product_name?: string
          status?: string
          suggested_order?: number
          trend_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      forecast_results: {
        Row: {
          accuracy_score: number | null
          confidence_high: number
          confidence_low: number
          created_at: string
          drug_name: string
          forecast_horizon_days: number
          id: string
          predicted_demand: number
          reorder_point: number | null
          suggested_order_qty: number | null
          trend: string
        }
        Insert: {
          accuracy_score?: number | null
          confidence_high: number
          confidence_low: number
          created_at?: string
          drug_name: string
          forecast_horizon_days?: number
          id?: string
          predicted_demand: number
          reorder_point?: number | null
          suggested_order_qty?: number | null
          trend: string
        }
        Update: {
          accuracy_score?: number | null
          confidence_high?: number
          confidence_low?: number
          created_at?: string
          drug_name?: string
          forecast_horizon_days?: number
          id?: string
          predicted_demand?: number
          reorder_point?: number | null
          suggested_order_qty?: number | null
          trend?: string
        }
        Relationships: []
      }
      Inventory_2023: {
        Row: {
          max_stock: number | null
          min_stock: number | null
          name: string | null
          price: number | null
          product_code: number | null
          stock_quantity: number | null
        }
        Insert: {
          max_stock?: number | null
          min_stock?: number | null
          name?: string | null
          price?: number | null
          product_code?: number | null
          stock_quantity?: number | null
        }
        Update: {
          max_stock?: number | null
          min_stock?: number | null
          name?: string | null
          price?: number | null
          product_code?: number | null
          stock_quantity?: number | null
        }
        Relationships: []
      }
      sales_history_2023: {
        Row: {
          Daily_Revenue: number
          Date: string
          Item_Code: number
          Item_Name: string
          Net_Daily_Sales: number
          Unit_Price: number
        }
        Insert: {
          Daily_Revenue: number
          Date: string
          Item_Code: number
          Item_Name: string
          Net_Daily_Sales: number
          Unit_Price: number
        }
        Update: {
          Daily_Revenue?: number
          Date?: string
          Item_Code?: number
          Item_Name?: string
          Net_Daily_Sales?: number
          Unit_Price?: number
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
