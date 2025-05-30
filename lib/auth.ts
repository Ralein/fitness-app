"use client"

import { createClient } from "@supabase/supabase-js"
import { useState, useEffect } from "react"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export { supabase }

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  daily_goal?: number
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email!)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email!)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      const response = await fetch(`/api/users?userId=${userId}`)
      const data = await response.json()

      if (data.user) {
        setUser(data.user)
      } else {
        // User doesn't exist in our database, create them
        console.log("User not found in database, creating profile...")
        await createUserProfile(userId, email)
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (userId: string, email: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: email.split("@")[0], // Use email prefix as default name
          email,
          daily_goal: 10000,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error creating user profile:", error)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    // Sign up without email confirmation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: undefined, // Remove email redirect
      },
    })

    if (error) throw error

    // Immediately create user profile after signup
    if (data.user) {
      await createUserProfile(data.user.id, email)
    }

    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...updates,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
}
