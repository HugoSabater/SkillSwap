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
            profiles: {
                Row: {
                    id: string
                    username: string
                    bio: string | null
                    time_balance: number
                    avatar_url: string | null
                    created_at?: string
                    updated_at?: string
                }
                Insert: {
                    id: string
                    username: string
                    bio?: string | null
                    time_balance?: number
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    bio?: string | null
                    time_balance?: number
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            skills: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    type: 'offering' | 'seeking'
                    years_exp: number
                    created_at?: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    type: 'offering' | 'seeking'
                    years_exp: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    type?: 'offering' | 'seeking'
                    years_exp?: number
                    created_at?: string
                }
            }
            swaps: {
                Row: {
                    id: string
                    sender_id: string
                    receiver_id: string
                    status: 'pending' | 'accepted' | 'completed' | 'canceled'
                    hours: number
                    scheduled_at: string | null
                    created_at?: string
                }
                Insert: {
                    id?: string
                    sender_id: string
                    receiver_id: string
                    status: 'pending' | 'accepted' | 'completed' | 'canceled'
                    hours: number
                    scheduled_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    sender_id?: string
                    receiver_id?: string
                    status?: 'pending' | 'accepted' | 'completed' | 'canceled'
                    hours?: number
                    scheduled_at?: string | null
                    created_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    swap_id: string
                    sender_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    swap_id: string
                    sender_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    swap_id?: string
                    sender_id?: string
                    content?: string
                    created_at?: string
                }
            }
            reviews: {
                Row: {
                    id: string
                    swap_id: string
                    reviewer_id: string
                    rating: number
                    comment: string | null
                    created_at?: string
                }
                Insert: {
                    id?: string
                    swap_id: string
                    reviewer_id: string
                    rating: number
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    swap_id?: string
                    reviewer_id?: string
                    rating?: number
                    comment?: string | null
                    created_at?: string
                }
            }
        }
    }
}
