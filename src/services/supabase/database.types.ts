// src/services/supabase/database.types.ts
//
// Hand-written Phase 1 Database type. To regenerate from a live Supabase
// project once the Supabase CLI is authenticated:
//
//   npx supabase login
//   npx supabase gen types typescript --project-id ospzscudnluxhayfckzj \
//     > src/services/supabase/database.types.ts
//
// Keep this file in sync with supabase/migrations/001_init.sql until that runs.

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
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          default_currency: string;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          default_currency?: string;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          kind: Database['public']['Enums']['wallet_kind'];
          initial_balance: number;
          color: string | null;
          icon: string | null;
          is_archived: boolean;
          position: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          kind?: Database['public']['Enums']['wallet_kind'];
          initial_balance?: number;
          color?: string | null;
          icon?: string | null;
          is_archived?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['wallets']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          kind: Database['public']['Enums']['category_kind'];
          color: string | null;
          icon: string | null;
          parent_id: string | null;
          is_archived: boolean;
          position: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          kind: Database['public']['Enums']['category_kind'];
          color?: string | null;
          icon?: string | null;
          parent_id?: string | null;
          is_archived?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          wallet_id: string;
          transfer_wallet_id: string | null;
          category_id: string | null;
          kind: Database['public']['Enums']['transaction_kind'];
          amount: number;
          occurred_at: string;
          note: string | null;
          tags: string[];
          receipt_path: string | null;
          recurring_rule_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_id: string;
          transfer_wallet_id?: string | null;
          category_id?: string | null;
          kind: Database['public']['Enums']['transaction_kind'];
          amount: number;
          occurred_at: string;
          note?: string | null;
          tags?: string[];
          receipt_path?: string | null;
          recurring_rule_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      recurring_rules: {
        Row: {
          id: string;
          user_id: string;
          wallet_id: string;
          category_id: string | null;
          kind: Database['public']['Enums']['transaction_kind'];
          amount: number;
          note: string | null;
          freq: Database['public']['Enums']['recurrence_freq'];
          interval: number;
          starts_on: string;
          ends_on: string | null;
          next_run_on: string;
          last_run_on: string | null;
          is_paused: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_id: string;
          category_id?: string | null;
          kind: Database['public']['Enums']['transaction_kind'];
          amount: number;
          note?: string | null;
          freq: Database['public']['Enums']['recurrence_freq'];
          interval?: number;
          starts_on: string;
          ends_on?: string | null;
          next_run_on: string;
          last_run_on?: string | null;
          is_paused?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['recurring_rules']['Insert']>;
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          amount: number;
          period_month: string | null;
          is_recurring: boolean;
          alert_threshold: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          amount: number;
          period_month?: string | null;
          is_recurring?: boolean;
          alert_threshold?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['budgets']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      wallet_kind: 'cash' | 'bank' | 'credit_card' | 'savings' | 'other';
      category_kind: 'expense' | 'income';
      transaction_kind: 'expense' | 'income' | 'transfer';
      recurrence_freq: 'daily' | 'weekly' | 'monthly' | 'yearly';
    };
    CompositeTypes: Record<string, never>;
  };
};
