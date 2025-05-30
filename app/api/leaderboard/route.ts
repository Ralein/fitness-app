import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "weekly"
    const competitionId = searchParams.get("competitionId")
    const userId = searchParams.get("userId")

    if (competitionId) {
      // Competition leaderboard
      const { data: leaderboard, error } = await supabase
        .from("user_competitions")
        .select(`
          user_id,
          current_progress,
          rank,
          users(name, avatar_url)
        `)
        .eq("competition_id", competitionId)
        .order("current_progress", { ascending: false })
        .limit(100)

      if (error) throw error
      return NextResponse.json({ leaderboard, type: "competition" })
    }

    // Global leaderboard
    const now = new Date()
    let startDate: string
    const endDate: string = now.toISOString().split("T")[0]

    switch (period) {
      case "daily":
        startDate = endDate
        break
      case "weekly":
        const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
        startDate = weekStart.toISOString().split("T")[0]
        break
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
        break
      default:
        startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    }

    // Get aggregated steps for the period
    const { data: stepData, error } = await supabase
      .from("steps")
      .select(`
        user_id,
        step_count,
        distance,
        calories,
        users(name, avatar_url, privacy_level)
      `)
      .gte("date", startDate)
      .lte("date", endDate)
      .eq("users.privacy_level", "public")

    if (error) throw error

    // Aggregate by user
    const userTotals = stepData.reduce((acc: any, step: any) => {
      if (!acc[step.user_id]) {
        acc[step.user_id] = {
          user_id: step.user_id,
          name: step.users.name,
          avatar_url: step.users.avatar_url,
          total_steps: 0,
          total_distance: 0,
          total_calories: 0,
        }
      }
      acc[step.user_id].total_steps += step.step_count
      acc[step.user_id].total_distance += step.distance
      acc[step.user_id].total_calories += step.calories
      return acc
    }, {})

    // Convert to array and sort
    const leaderboard = Object.values(userTotals)
      .sort((a: any, b: any) => b.total_steps - a.total_steps)
      .slice(0, 100)
      .map((user: any, index: number) => ({
        ...user,
        rank: index + 1,
      }))

    // Find current user's position if provided
    let userRank = null
    if (userId) {
      const userIndex = leaderboard.findIndex((user: any) => user.user_id === userId)
      userRank = userIndex >= 0 ? userIndex + 1 : null
    }

    return NextResponse.json({
      leaderboard,
      period,
      userRank,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
