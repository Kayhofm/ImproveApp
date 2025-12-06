export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "editor" | "viewer";

export type FieldType =
  | "short_text"
  | "long_text"
  | "number"
  | "boolean"
  | "select"
  | "multi_select"
  | "scale"
  | "date"
  | "file";

export type BehaviorType = "boolean" | "scale" | "number";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          program_start_date: string | null;
          role: UserRole;
          timezone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          program_start_date?: string | null;
          role?: UserRole;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          program_start_date?: string | null;
          role?: UserRole;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      calendars: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          start_date: string;
          duration_days: number;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          start_date: string;
          duration_days?: number;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendars"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "calendars_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      calendar_days: {
        Row: {
          id: string;
          calendar_id: string;
          day_number: number;
          day_date: string;
          assignment_title: string;
          assignment_summary: string | null;
          tracker_prompt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          calendar_id: string;
          day_number: number;
          day_date: string;
          assignment_title: string;
          assignment_summary?: string | null;
          tracker_prompt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_days"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "calendar_days_calendar_id_fkey";
            columns: ["calendar_id"];
            referencedRelation: "calendars";
            referencedColumns: ["id"];
          }
        ];
      };
      calendar_field_templates: {
        Row: {
          id: string;
          calendar_day_id: string;
          field_key: string;
          field_label: string;
          field_type: FieldType;
          help_text: string | null;
          is_required: boolean;
          options: Json | null;
          order_index: number;
          data_unit: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          calendar_day_id: string;
          field_key: string;
          field_label: string;
          field_type: FieldType;
          help_text?: string | null;
          is_required?: boolean;
          options?: Json | null;
          order_index?: number;
          data_unit?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_field_templates"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "calendar_field_templates_calendar_day_id_fkey";
            columns: ["calendar_day_id"];
            referencedRelation: "calendar_days";
            referencedColumns: ["id"];
          }
        ];
      };
      calendar_behavior_templates: {
        Row: {
          id: string;
          calendar_id: string;
          metric_key: string;
          metric_label: string;
          metric_type: BehaviorType;
          unit_label: string | null;
          min_value: number | null;
          max_value: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          calendar_id: string;
          metric_key: string;
          metric_label: string;
          metric_type: BehaviorType;
          unit_label?: string | null;
          min_value?: number | null;
          max_value?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_behavior_templates"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "calendar_behavior_templates_calendar_id_fkey";
            columns: ["calendar_id"];
            referencedRelation: "calendars";
            referencedColumns: ["id"];
          }
        ];
      };
      calendar_entries: {
        Row: {
          id: string;
          calendar_day_id: string;
          field_template_id: string;
          user_id: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          calendar_day_id: string;
          field_template_id: string;
          user_id: string;
          value: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_entries"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "calendar_entries_calendar_day_id_fkey";
            columns: ["calendar_day_id"];
            referencedRelation: "calendar_days";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_entries_field_template_id_fkey";
            columns: ["field_template_id"];
            referencedRelation: "calendar_field_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_entries_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      behavior_logs: {
        Row: {
          id: string;
          calendar_day_id: string;
          behavior_template_id: string;
          user_id: string;
          boolean_value: boolean | null;
          numeric_value: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          calendar_day_id: string;
          behavior_template_id: string;
          user_id: string;
          boolean_value?: boolean | null;
          numeric_value?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["behavior_logs"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "behavior_logs_behavior_template_id_fkey";
            columns: ["behavior_template_id"];
            referencedRelation: "calendar_behavior_templates";
            referencedColumns: ["id"];
          }
        ];
      };
      insight_snapshots: {
        Row: {
          id: string;
          user_id: string;
          calendar_id: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          calendar_id: string;
          payload: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["insight_snapshots"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      field_type: FieldType;
      behavior_type: BehaviorType;
    };
  };
}
