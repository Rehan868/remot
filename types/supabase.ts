export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          booking_number: string
          guest_name: string
          guest_email: string
          guest_phone: string | null
          property: string
          room_number: string
          check_in: string
          check_out: string
          adults: number
          children: number
          base_rate: number
          amount: number
          amount_paid: number
          remaining_amount: number
          security_deposit: number
          commission: number
          tourism_fee: number
          vat: number
          net_to_owner: number
          notes: string | null
          status: "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled"
          payment_status: "pending" | "partial" | "paid" | "refunded"
          guest_document: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_number: string
          guest_name: string
          guest_email: string
          guest_phone?: string | null
          property: string
          room_number: string
          check_in: string
          check_out: string
          adults: number
          children: number
          base_rate: number
          amount: number
          amount_paid?: number
          remaining_amount?: number
          security_deposit?: number
          commission?: number
          tourism_fee?: number
          vat?: number
          net_to_owner?: number
          notes?: string | null
          status?: "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled"
          payment_status?: "pending" | "partial" | "paid" | "refunded"
          guest_document?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_number?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string | null
          property?: string
          room_number?: string
          check_in?: string
          check_out?: string
          adults?: number
          children?: number
          base_rate?: number
          amount?: number
          amount_paid?: number
          remaining_amount?: number
          security_deposit?: number
          commission?: number
          tourism_fee?: number
          vat?: number
          net_to_owner?: number
          notes?: string | null
          status?: "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled"
          payment_status?: "pending" | "partial" | "paid" | "refunded"
          guest_document?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      permissions: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          created_at?: string
        }
      }
      role_permissions: {
        Row: {
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          role_id: string
          permission_id: string
          created_at?: string
        }
        Update: {
          role_id?: string
          permission_id?: string
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          user_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          role_id?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      owners: {
        Row: {
          id: string
          firstName: string
          lastName: string
          email: string
          password: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zipCode: string | null
          country: string | null
          notes: string | null
          birthdate: string | null
          citizenship: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firstName: string
          lastName: string
          email: string
          password: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zipCode?: string | null
          country?: string | null
          notes?: string | null
          birthdate?: string | null
          citizenship?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          firstName?: string
          lastName?: string
          email?: string
          password?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zipCode?: string | null
          country?: string | null
          notes?: string | null
          birthdate?: string | null
          citizenship?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      owner_accounting_info: {
        Row: {
          owner_id: string
          paymentMethod: string | null
          accountNumber: string | null
          bankName: string | null
          iban: string | null
          swift: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          owner_id: string
          paymentMethod?: string | null
          accountNumber?: string | null
          bankName?: string | null
          iban?: string | null
          swift?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          owner_id?: string
          paymentMethod?: string | null
          accountNumber?: string | null
          bankName?: string | null
          iban?: string | null
          swift?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      owner_tax_info: {
        Row: {
          owner_id: string
          taxId: string | null
          taxResidence: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          owner_id: string
          taxId?: string | null
          taxResidence?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          owner_id?: string
          taxId?: string | null
          taxResidence?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      owner_tax_documents: {
        Row: {
          id: string
          owner_id: string
          document_url: string
          document_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          document_url: string
          document_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          document_url?: string
          document_name?: string | null
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          number: string | null
          name: string | null
          property: string | null
          property_id: string | null
          type: string | null
          status: string | null
          rate: number | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          number?: string | null
          name?: string | null
          property?: string | null
          property_id?: string | null
          type?: string | null
          status?: string | null
          rate?: number | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          number?: string | null
          name?: string | null
          property?: string | null
          property_id?: string | null
          type?: string | null
          status?: string | null
          rate?: number | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
