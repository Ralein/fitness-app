"use client"

import { createClientSupabaseClient } from "./supabase"
import { useEffect, useState } from "react"

export function useRealtimeLeaderboard(competitionId?: string) {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    if (!competitionId) return

    // Subscribe to real-time changes
    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_competitions",
          filter: `competition_id=eq.${competitionId}`,
        },
        (payload) => {
          console.log("Leaderboard updated:", payload)
          // Refresh leaderboard data
          fetchLeaderboard()
        },
      )
      .subscribe()

    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from("user_competitions")
        .select(`
          *,
          users:user_id (name, avatar_url)
        `)
        .eq("competition_id", competitionId)
        .order("current_progress", { ascending: false })

      if (data) setLeaderboard(data)
    }

    fetchLeaderboard()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [competitionId])

  return leaderboard
}

export function useRealtimeSteps(userId: string) {
  const [steps, setSteps] = useState<any[]>([])
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel("steps-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "steps",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Steps updated:", payload)
          // Update local state
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            setSteps((prev) => {
              const updated = prev.filter((s) => s.id !== payload.new.id)
              return [...updated, payload.new]
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return steps
}
