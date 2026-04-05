export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          x_handle: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          email?: string | null;
          x_handle?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          x_handle?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      threads: {
        Row: {
          id: string;
          user_id: string;
          contact_id: string;
          title: string;
          type: string;
          status: string;
          next_followup_at: string | null;
          next_message_draft: string | null;
          last_touched_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          contact_id: string;
          title: string;
          type?: string;
          status?: string;
          next_followup_at?: string | null;
          next_message_draft?: string | null;
          last_touched_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          contact_id?: string;
          title?: string;
          type?: string;
          status?: string;
          next_followup_at?: string | null;
          next_message_draft?: string | null;
          last_touched_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "threads_contact_user_fk";
            columns: ["contact_id", "user_id"];
            referencedRelation: "contacts";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      touches: {
        Row: {
          id: string;
          user_id: string;
          thread_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          thread_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          thread_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "touches_thread_user_fk";
            columns: ["thread_id", "user_id"];
            referencedRelation: "threads";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      user_settings: {
        Row: {
          user_id: string;
          digest_enabled: boolean;
          digest_time_local: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          digest_enabled?: boolean;
          digest_time_local?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          digest_enabled?: boolean;
          digest_time_local?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      digest_logs: {
        Row: {
          id: string;
          user_id: string;
          sent_at: string;
          status: "sent" | "error";
          error_message: string | null;
          counts: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          sent_at?: string;
          status: "sent" | "error";
          error_message?: string | null;
          counts?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          sent_at?: string;
          status?: "sent" | "error";
          error_message?: string | null;
          counts?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
