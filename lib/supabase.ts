import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for API routes
export const createServerSupabaseClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Database types
export interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  daily_goal: number
  weekly_goal: number
  monthly_goal: number
  timezone: string
  units: "metric" | "imperial"
  privacy_level: "public" | "friends" | "private"
  created_at: string
  updated_at: string
}

export interface Steps {
  id: string
  user_id: string
  date: string
  step_count: number
  distance: number
  calories: number
  active_minutes: number
  floors_climbed: number
  created_at: string
  updated_at: string
}

export interface Competition {
  id: string
  name: string
  description?: string
  goal: number
  goal_type: "steps" | "distance" | "calories"
  start_date: string
  end_date: string
  difficulty: "Easy" | "Medium" | "Hard"
  max_participants?: number
  is_public: boolean
  created_by: string
  prize_description?: string
  created_at: string
}

export interface Achievement {
  id: string
  name: string
  description?: string
  icon?: string
  category: string
  requirement_type: string
  requirement_value: number
  points: number
  is_hidden: boolean
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  progress: number
  achievement?: Achievement
}
