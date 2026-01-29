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
      acquisition_types: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id?: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          color_class: string | null
          created_at: string | null
          date: string
          description: string | null
          icon: string | null
          id: string
          owner_id: string
          pet_id: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          color_class?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          icon?: string | null
          id?: string
          owner_id: string
          pet_id: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          color_class?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          icon?: string | null
          id?: string
          owner_id?: string
          pet_id?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "mv_pet_health_stats"
            referencedColumns: ["pet_id"]
          }
        ]
      }
      admin_audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          role: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          last_login?: string | null
          role: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          role?: string
          status?: string | null
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          confidence_score: number | null
          context: Json | null
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          generated_by_model: string | null
          id: string
          metadata: Json | null
          title: string
          type: string
          user_feedback: Json | null
        }
        Insert: {
          confidence_score?: number | null
          context?: Json | null
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          generated_by_model?: string | null
          id?: string
          metadata?: Json | null
          title: string
          type: string
          user_feedback?: Json | null
        }
        Update: {
          confidence_score?: number | null
          context?: Json | null
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          generated_by_model?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_feedback?: Json | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          pet_id: string
          status: string
          title: string
          user_id: string
          vet_name: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          pet_id: string
          status: string
          title: string
          user_id: string
          vet_name?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          pet_id?: string
          status?: string
          title?: string
          user_id?: string
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "mv_pet_health_stats"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          is_recurring: boolean | null
          location: string | null
          owner_id: string
          recurrence_rule: string | null
          reminders: Json | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          owner_id: string
          recurrence_rule?: string | null
          reminders?: Json | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          owner_id?: string
          recurrence_rule?: string | null
          reminders?: Json | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      content_moderation_queue: {
        Row: {
          ai_confidence: number | null
          ai_flagged: boolean | null
          ai_flags: Json | null
          appeal_notes: string | null
          appeal_reviewed_by: string | null
          appealed: boolean | null
          content_id: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          priority: number | null
          reason: string | null
          status: string | null
          submitted_by: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_flagged?: boolean | null
          ai_flags?: Json | null
          appeal_notes?: string | null
          appeal_reviewed_by?: string | null
          appealed?: boolean | null
          content_id: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          priority?: number | null
          reason?: string | null
          status?: string | null
          submitted_by: string
        }
        Update: {
          ai_confidence?: number | null
          ai_flagged?: boolean | null
          ai_flags?: Json | null
          appeal_notes?: string | null
          appeal_reviewed_by?: string | null
          appealed?: boolean | null
          content_id?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          priority?: number | null
          reason?: string | null
          status?: string | null
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_queue_appeal_reviewed_by_fkey"
            columns: ["appeal_reviewed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_moderation_queue_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_moderation_queue_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          feature_key: string
          id: string
          rollout_percentage: number | null
          target_roles: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          feature_key: string
          id?: string
          rollout_percentage?: number | null
          target_roles?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          feature_key?: string
          id?: string
          rollout_percentage?: number | null
          target_roles?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          category: string
          created_at: string | null
          id: string
          metric_name: string
          notes: string | null
          pet_id: string
          recorded_at: string | null
          unit: string | null
          value: string | null
          value_num: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          metric_name: string
          notes?: string | null
          pet_id: string
          recorded_at?: string | null
          unit?: string | null
          value?: string | null
          value_num?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          metric_name?: string
          notes?: string | null
          pet_id?: string
          recorded_at?: string | null
          unit?: string | null
          value?: string | null
          value_num?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_metrics_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "mv_pet_health_stats"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "health_metrics_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          }
        ]
      }
      health_records: {
        Row: {
          action_plan: string | null
          attachments: string[] | null
          category: string | null
          created_at: string | null
          date_recorded: string
          description: string | null
          doctor_name: string | null
          follow_up_date: string | null
          id: string
          metadata: Json | null
          pet_id: string
          record_type: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_plan?: string | null
          attachments?: string[] | null
          category?: string | null
          created_at?: string | null
          date_recorded?: string
          description?: string | null
          doctor_name?: string | null
          follow_up_date?: string | null
          id?: string
          metadata?: Json | null
          pet_id: string
          record_type: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_plan?: string | null
          attachments?: string[] | null
          category?: string | null
          created_at?: string | null
          date_recorded?: string
          description?: string | null
          doctor_name?: string | null
          follow_up_date?: string | null
          id?: string
          metadata?: Json | null
          pet_id?: string
          record_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "mv_pet_health_stats"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "health_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      locations: {
        Row: {
          address: string | null
          city: string | null
          coordinates: unknown | null
          country: string | null
          created_at: string | null
          full_address: string | null
          id: string
          latitude: number
          longitude: number
          mapbox_id: string | null
          name: string
          place_type: string
          postal_code: string | null
          state: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          coordinates?: unknown | null
          country?: string | null
          created_at?: string | null
          full_address?: string | null
          id?: string
          latitude: number
          longitude: number
          mapbox_id?: string | null
          name: string
          place_type: string
          postal_code?: string | null
          state?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          coordinates?: unknown | null
          country?: string | null
          created_at?: string | null
          full_address?: string | null
          id?: string
          latitude?: number
          longitude?: number
          mapbox_id?: string | null
          name?: string
          place_type?: string
          postal_code?: string | null
          state?: string | null
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          instructions: string | null
          name: string
          next_dose: string | null
          pet_id: string
          start_date: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          name: string
          next_dose?: string | null
          pet_id: string
          start_date: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          name?: string
          next_dose?: string | null
          pet_id?: string
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "mv_pet_health_stats"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "medications_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          channel: Database["public"]["Enums"]["notification_type"][] | null
          created_at: string | null
          expires_at: string | null
          id: string
          priority: string | null
          read: boolean | null
          read_at: string | null
          resource_id: string | null
          resource_type: string | null
          sender_id: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body: string
          channel?: Database["public"]["Enums"]["notification_type"][] | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          sender_id?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          channel?: Database["public"]["Enums"]["notification_type"][] | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          sender_id?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pets: {
        Row: {
          activity_level: string | null
          age: string | null
          allergies: string[] | null
          behavioral_notes: string | null
          birthday: string | null
          blood_type: string | null
          breed: string | null
          breed_notes: string | null
          coat_type: string | null
          color: string | null
          conditions: string[] | null
          created_at: string | null
          dietary_needs: string | null
          distinguishing_marks: string | null
          ear_type: string | null
          eye_color: string | null
          gender: string | null
          id: string
          image: string | null
          is_service_animal: boolean | null
          medical_notes: string | null
          microchip_id: string | null
          microchip_type: string | null
          name: string
          neutered: boolean | null
          owner_id: string
          passport_date: string | null
          passport_issuer: string | null
          passport_number: string | null
          registration_number: string | null
          social_link: string | null
          species: string | null
          status: string
          tail_type: string | null
          updated_at: string | null
          veterinarian: string | null
          veterinarian_contact: string | null
          weight: string | null
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: string | null
          allergies?: string[] | null
          behavioral_notes?: string | null
          birthday?: string | null
          blood_type?: string | null
          breed?: string | null
          breed_notes?: string | null
          coat_type?: string | null
          color?: string | null
          conditions?: string[] | null
          created_at?: string | null
          dietary_needs?: string | null
          distinguishing_marks?: string | null
          ear_type?: string | null
          eye_color?: string | null
          gender?: string | null
          id?: string
          image?: string | null
          is_service_animal?: boolean | null
          medical_notes?: string | null
          microchip_id?: string | null
          microchip_type?: string | null
          name: string
          neutered?: boolean | null
          owner_id: string
          passport_date?: string | null
          passport_issuer?: string | null
          passport_number?: string | null
          registration_number?: string | null
          social_link?: string | null
          species?: string | null
          status?: string
          tail_type?: string | null
          updated_at?: string | null
          veterinarian?: string | null
          veterinarian_contact?: string | null
          weight?: string | null
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: string | null
          allergies?: string[] | null
          behavioral_notes?: string | null
          birthday?: string | null
          blood_type?: string | null
          breed?: string | null
          breed_notes?: string | null
          coat_type?: string | null
          color?: string | null
          conditions?: string[] | null
          created_at?: string | null
          dietary_needs?: string | null
          distinguishing_marks?: string | null
          ear_type?: string | null
          eye_color?: string | null
          gender?: string | null
          id?: string
          image?: string | null
          is_service_animal?: boolean | null
          medical_notes?: string | null
          microchip_id?: string | null
          microchip_type?: string | null
          name?: string
          neutered?: boolean | null
          owner_id?: string
          passport_date?: string | null
          passport_issuer?: string | null
          passport_number?: string | null
          registration_number?: string | null
          social_link?: string | null
          species?: string | null
          status?: string
          tail_type?: string | null
          updated_at?: string | null
          veterinarian?: string | null
          veterinarian_contact?: string | null
          weight?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      platform_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      reference_breeds: {
        Row: {
          average_weight_kg: number | null
          breed_group: string | null
          description: string | null
          friendly_with_children: boolean | null
          friendly_with_dogs: boolean | null
          grooming_needs: string | null
          hypoallergenic: boolean | null
          id: string
          image_url: string | null
          incompatible_breeds: string[] | null
          life_expectancy_years: string | null
          name: string
          origin: string | null
          shedding_level: string | null
          size: string | null
          species: string
          temperament: string[] | null
        }
        Insert: {
          average_weight_kg?: number | null
          breed_group?: string | null
          description?: string | null
          friendly_with_children?: boolean | null
          friendly_with_dogs?: boolean | null
          grooming_needs?: string | null
          hypoallergenic?: boolean | null
          id?: string
          image_url?: string | null
          incompatible_breeds?: string[] | null
          life_expectancy_years?: string | null
          name: string
          origin?: string | null
          shedding_level?: string | null
          size?: string | null
          species: string
          temperament?: string[] | null
        }
        Update: {
          average_weight_kg?: number | null
          breed_group?: string | null
          description?: string | null
          friendly_with_children?: boolean | null
          friendly_with_dogs?: boolean | null
          grooming_needs?: string | null
          hypoallergenic?: boolean | null
          id?: string
          image_url?: string | null
          incompatible_breeds?: string[] | null
          life_expectancy_years?: string | null
          name?: string
          origin?: string | null
          shedding_level?: string | null
          size?: string | null
          species?: string
          temperament?: string[] | null
        }
        Relationships: []
      }
      rel_pet_guardians: {
        Row: {
          access_level: Database["public"]["Enums"]["access_role"] | null
          assigned_at: string | null
          assigned_by: string | null
          guardian_id: string
          id: string
          pet_id: string
          permissions: string[] | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_role"] | null
          assigned_at?: string | null
          assigned_by?: string | null
          guardian_id: string
          id?: string
          pet_id: string
          permissions?: string[] | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_role"] | null
          assigned_at?: string | null
          assigned_by?: string | null
          guardian_id?: string
          id?: string
          pet_id?: string
          permissions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "rel_pet_guardians_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rel_pet_guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rel_pet_guardians_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "mv_pet_health_stats"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "rel_pet_guardians_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          }
        ]
      }
      translations: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          key: string
          language_code: string
          updated_at: string | null
          value: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          key: string
          language_code: string
          updated_at?: string | null
          value: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          key?: string
          language_code?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          onboarding_completed: boolean | null
          phone: string | null
          plan: string | null
          preferences: Json | null
          roles: string[] | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          id: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          onboarding_completed?: boolean | null
          phone?: string | null
          plan?: string | null
          preferences?: Json | null
          roles?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          plan?: string | null
          preferences?: Json | null
          roles?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          batch_number: string | null
          created_at: string | null
          date_administered: string
          id: string
          manufacturer: string | null
          next_due_date: string | null
          notes: string | null
          pet_id: string
          provider_id: string | null
          status: string | null
          vaccine_name: string
          veterinarian: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          date_administered: string
          id?: string
          manufacturer?: string | null
          next_due_date?: string | null
          notes?: string | null
          pet_id: string
          provider_id?: string | null
          status?: string | null
          vaccine_name: string
          veterinarian?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          date_administered?: string
          id?: string
          manufacturer?: string | null
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string
          provider_id?: string | null
          status?: string | null
          vaccine_name?: string
          veterinarian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "mv_pet_health_stats"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "vaccinations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      location_clusters: {
        Row: {
          center_lat: number | null
          center_lng: number | null
          id: number | null
          location_count: number | null
        }
        Relationships: []
      }
      mv_pet_health_stats: {
        Row: {
          last_checkup: string | null
          medical_count: number | null
          pet_id: string | null
          total_conditions: number | null
          total_medications: number | null
          total_vaccines: number | null
          vaccine_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_distance: {
        Args: {
          lat1: number
          lng1: number
          lat2: number
          lng2: number
        }
        Returns: number
      }
      get_nearby_users: {
        Args: {
          user_lat: number
          user_lng: number
          radius_km: number
        }
        Returns: {
          user_id: string
          name: string
          image: string
          latitude: number
          longitude: number
          distance: number
        }[]
      }
      handle_new_user: {
        Args: {
          event: Json
        }
        Returns: Json
      }
    }
    Enums: {
      access_role: "owner" | "co_owner" | "editor" | "viewer"
      ai_content_type:
      | "pet_insight"
      | "breed_recommendation"
      | "health_article"
      | "care_guide"
      | "training_tip"
      | "nutrition_advice"
      | "exercise_plan"
      | "grooming_guide"
      | "behavior_analysis"
      audit_action:
      | "create"
      | "update"
      | "delete"
      | "login"
      | "logout"
      | "permission_change"
      | "export_data"
      | "share"
      | "payment"
      | "subscribe"
      | "cancel"
      | "generate_ai"
      | "upload_media"
      content_type:
      | "article"
      | "recommendation"
      | "faq"
      | "care_guide"
      | "training_tip"
      | "health_alert"
      | "breed_info"
      | "product_review"
      media_type:
      | "pet_photo"
      | "profile_photo"
      | "document"
      | "placeholder"
      | "generated_image"
      | "vaccine_certificate"
      | "video"
      notification_type: "push" | "email" | "sms" | "in_app"
      pet_gender: "Male" | "Female" | "Unknown"
    }
  }
}

export const Constants = {
  public: {
    Enums: {
      access_role: ["owner", "co_owner", "editor", "viewer"],
      ai_content_type: [
        "pet_insight",
        "breed_recommendation",
        "health_article",
        "care_guide",
        "training_tip",
        "nutrition_advice",
        "exercise_plan",
        "grooming_guide",
        "behavior_analysis",
      ],
      audit_action: [
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "permission_change",
        "export_data",
        "share",
        "payment",
        "subscribe",
        "cancel",
        "generate_ai",
        "upload_media",
      ],
      content_type: [
        "article",
        "recommendation",
        "faq",
        "care_guide",
        "training_tip",
        "health_alert",
        "breed_info",
        "product_review",
      ],
      media_type: [
        "pet_photo",
        "profile_photo",
        "document",
        "placeholder",
        "generated_image",
        "vaccine_certificate",
        "video",
      ],
      notification_type: ["push", "email", "sms", "in_app"],
      pet_gender: ["Male", "Female", "Unknown"],
    },
  },
} as const
