// Database types generated from schema
// These types match the Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      analysis_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          device_id: string | null;
          input_type: "screenshot" | "text" | "voice";
          input_content: string | null;
          input_mime_type: string | null;
          mode: "relationship" | "scam" | "self_analysis";
          platform: string | null;
          relationship_type: string | null;
          threat_level: "green" | "yellow" | "orange" | "red" | null;
          health_score: number | null;
          primary_tactic: string | null;
          tactics_count: number | null;
          extracted_data: Json | null;
          classification_data: Json | null;
          psychology_data: Json | null;
          defense_data: Json | null;
          guardian_response: Json | null;
          voice_script: string | null;
          audio_url: string | null;
          processing_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          device_id?: string | null;
          input_type: "screenshot" | "text" | "voice";
          input_content?: string | null;
          input_mime_type?: string | null;
          mode: "relationship" | "scam" | "self_analysis";
          platform?: string | null;
          relationship_type?: string | null;
          threat_level?: "green" | "yellow" | "orange" | "red" | null;
          health_score?: number | null;
          primary_tactic?: string | null;
          tactics_count?: number | null;
          extracted_data?: Json | null;
          classification_data?: Json | null;
          psychology_data?: Json | null;
          defense_data?: Json | null;
          guardian_response?: Json | null;
          voice_script?: string | null;
          audio_url?: string | null;
          processing_time_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          device_id?: string | null;
          input_type?: "screenshot" | "text" | "voice";
          input_content?: string | null;
          input_mime_type?: string | null;
          mode?: "relationship" | "scam" | "self_analysis";
          platform?: string | null;
          relationship_type?: string | null;
          threat_level?: "green" | "yellow" | "orange" | "red" | null;
          health_score?: number | null;
          primary_tactic?: string | null;
          tactics_count?: number | null;
          extracted_data?: Json | null;
          classification_data?: Json | null;
          psychology_data?: Json | null;
          defense_data?: Json | null;
          guardian_response?: Json | null;
          voice_script?: string | null;
          audio_url?: string | null;
          processing_time_ms?: number | null;
          created_at?: string;
        };
      };
      detected_tactics: {
        Row: {
          id: string;
          session_id: string | null;
          tactic_key: string;
          tactic_name: string;
          category: string;
          severity: "low" | "medium" | "high" | "critical" | null;
          confidence: number | null;
          evidence_quotes: string[] | null;
          message_indices: number[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          tactic_key: string;
          tactic_name: string;
          category: string;
          severity?: "low" | "medium" | "high" | "critical" | null;
          confidence?: number | null;
          evidence_quotes?: string[] | null;
          message_indices?: number[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          tactic_key?: string;
          tactic_name?: string;
          category?: string;
          severity?: "low" | "medium" | "high" | "critical" | null;
          confidence?: number | null;
          evidence_quotes?: string[] | null;
          message_indices?: number[] | null;
          created_at?: string;
        };
      };
      conversation_messages: {
        Row: {
          id: string;
          session_id: string | null;
          sender: "user" | "other";
          content: string;
          message_index: number;
          timestamp_original: string | null;
          is_flagged: boolean | null;
          flagged_tactics: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          sender: "user" | "other";
          content: string;
          message_index: number;
          timestamp_original?: string | null;
          is_flagged?: boolean | null;
          flagged_tactics?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          sender?: "user" | "other";
          content?: string;
          message_index?: number;
          timestamp_original?: string | null;
          is_flagged?: boolean | null;
          flagged_tactics?: string[] | null;
          created_at?: string;
        };
      };
      evidence_vault: {
        Row: {
          id: string;
          device_id: string;
          session_id: string | null;
          title: string;
          description: string | null;
          evidence_type: "screenshot" | "text" | "export" | null;
          content: string | null;
          mime_type: string | null;
          tags: string[] | null;
          folder: string | null;
          is_starred: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          session_id?: string | null;
          title: string;
          description?: string | null;
          evidence_type?: "screenshot" | "text" | "export" | null;
          content?: string | null;
          mime_type?: string | null;
          tags?: string[] | null;
          folder?: string | null;
          is_starred?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          session_id?: string | null;
          title?: string;
          description?: string | null;
          evidence_type?: "screenshot" | "text" | "export" | null;
          content?: string | null;
          mime_type?: string | null;
          tags?: string[] | null;
          folder?: string | null;
          is_starred?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      health_score_history: {
        Row: {
          id: string;
          device_id: string;
          session_id: string | null;
          score: number | null;
          threat_level: string | null;
          primary_tactic: string | null;
          mode: string | null;
          relationship_label: string | null;
          notes: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          session_id?: string | null;
          score?: number | null;
          threat_level?: string | null;
          primary_tactic?: string | null;
          mode?: string | null;
          relationship_label?: string | null;
          notes?: string | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          session_id?: string | null;
          score?: number | null;
          threat_level?: string | null;
          primary_tactic?: string | null;
          mode?: string | null;
          relationship_label?: string | null;
          notes?: string | null;
          recorded_at?: string;
        };
      };
      pdf_exports: {
        Row: {
          id: string;
          device_id: string;
          session_id: string | null;
          title: string;
          export_type: "single" | "timeline" | "evidence" | null;
          storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          session_id?: string | null;
          title: string;
          export_type?: "single" | "timeline" | "evidence" | null;
          storage_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          session_id?: string | null;
          title?: string;
          export_type?: "single" | "timeline" | "evidence" | null;
          storage_path?: string | null;
          created_at?: string;
        };
      };
      scam_reports: {
        Row: {
          id: string;
          session_id: string | null;
          scam_type: string;
          sender_identifier: string | null;
          urls_detected: string[] | null;
          is_verified: boolean | null;
          report_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          scam_type: string;
          sender_identifier?: string | null;
          urls_detected?: string[] | null;
          is_verified?: boolean | null;
          report_count?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          scam_type?: string;
          sender_identifier?: string | null;
          urls_detected?: string[] | null;
          is_verified?: boolean | null;
          report_count?: number | null;
          created_at?: string;
        };
      };
      self_analysis_patterns: {
        Row: {
          id: string;
          device_id: string;
          session_id: string | null;
          pattern_type: string;
          frequency: "rare" | "occasional" | "frequent" | "constant" | null;
          examples: string[] | null;
          healthier_alternatives: string[] | null;
          root_cause_explanation: string | null;
          detected_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          session_id?: string | null;
          pattern_type: string;
          frequency?: "rare" | "occasional" | "frequent" | "constant" | null;
          examples?: string[] | null;
          healthier_alternatives?: string[] | null;
          root_cause_explanation?: string | null;
          detected_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          session_id?: string | null;
          pattern_type?: string;
          frequency?: "rare" | "occasional" | "frequent" | "constant" | null;
          examples?: string[] | null;
          healthier_alternatives?: string[] | null;
          root_cause_explanation?: string | null;
          detected_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      get_threat_distribution: {
        Args: { p_device_id: string };
        Returns: {
          threat_level: string;
          count: number;
          percentage: number;
        }[];
      };
      get_top_tactics: {
        Args: { p_device_id: string; p_limit?: number };
        Returns: {
          tactic_key: string;
          tactic_name: string;
          occurrence_count: number;
          avg_confidence: number;
        }[];
      };
      get_health_trend: {
        Args: { p_device_id: string; p_days?: number };
        Returns: {
          date: string;
          avg_score: number;
          analysis_count: number;
        }[];
      };
    };
    Enums: {};
  };
}
