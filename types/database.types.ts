export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_used: boolean
          user_id: string | null
          video_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          user_id?: string | null
          video_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          user_id?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_codes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          }
        ]
      }
      video_views: {
        Row: {
          id: string
          last_watched_at: string | null
          user_id: string
          video_id: string
          watch_count: number
        }
        Insert: {
          id?: string
          last_watched_at?: string | null
          user_id: string
          video_id: string
          watch_count?: number
        }
        Update: {
          id?: string
          last_watched_at?: string | null
          user_id?: string
          video_id?: string
          watch_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          }
        ]
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_hidden: boolean
          title: string
          video_path: string | null
          youtube_video_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_hidden?: boolean
          title: string
          video_path?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_hidden?: boolean
          title?: string
          video_path?: string | null
          youtube_video_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }

    Views: {
      [_ in never]: never
    }
    Functions: {
      redeem_access_code: {
        Args: {
          p_code: string
          p_user_id: string
          p_video_id: string
        }
        Returns: boolean
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
