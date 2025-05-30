import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const date = searchParams.get("date")
    const period = searchParams.get("period") // week, month, year
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    let query = supabase.from("steps").select("*").eq("user_id", userId).order("date", { ascending: false })

    if (date) {
      query = query.eq("date", date)
      const { data: steps, error } = await query.single()
      if (error && error.code !== "PGRST116") throw error
      return NextResponse.json({ steps: steps || null })
    }

    if (startDate && endDate) {
      query = query.gte("date", startDate).lte("date", endDate)
    } else if (period) {
      const now = new Date()
      let fromDate: string

      switch (period) {
        case "week":
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          break
        case "month":
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
          break
        case "year":
          fromDate = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0]
          break
        default:
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      }
      query = query.gte("date", fromDate)
    }

    const { data: steps, error } = await query.limit(365)
    if (error) throw error

    return NextResponse.json({ steps })
  } catch (error) {
    console.error("Error fetching steps:", error)
    return NextResponse.json({ error: "Failed to fetch steps" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, date, stepCount, distance, calories, activeMinutes, floorsClimbed } = body

    if (!userId || !date || stepCount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upsert steps data (update if exists, insert if not)
    const { data: steps, error } = await supabase
      .from("steps")
      .upsert(
        {
          user_id: userId,
          date,
          step_count: stepCount,
          distance: distance || 0,
          calories: calories || Math.round(stepCount * 0.04),
          active_minutes: activeMinutes || Math.round(stepCount * 0.01),
          floors_climbed: floorsClimbed || 0,
        },
        {
          onConflict: "user_id,date",
        },
      )
      .select()
      .single()

    if (error) throw error

    // Check for achievements
    await checkAchievements(userId, stepCount, date)

    return NextResponse.json({ steps }, { status: 201 })
  } catch (error) {
    console.error("Error saving steps:", error)
    return NextResponse.json({ error: "Failed to save steps" }, { status: 500 })
  }
}

async function checkAchievements(userId: string, stepCount: number, date: string) {
  try {
    // Get user's total steps
    const { data: totalSteps } = await supabase.from("steps").select("step_count").eq("user_id", userId)

    const total = totalSteps?.reduce((sum, day) => sum + day.step_count, 0) || 0

    // Get user's daily goal
    const { data: user } = await supabase.from("users").select("daily_goal").eq("id", userId).single()

    const dailyGoal = user?.daily_goal || 10000

    // Check achievements
    const achievementsToCheck = [
      { requirement_type: "total_steps", value: total },
      { requirement_type: "daily_goal", value: stepCount >= dailyGoal ? 1 : 0 },
    ]

    for (const check of achievementsToCheck) {
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("requirement_type", check.requirement_type)
        .lte("requirement_value", check.value)

      if (achievements) {
        for (const achievement of achievements) {
          // Check if user already has this achievement
          const { data: existing } = await supabase
            .from("user_achievements")
            .select("id")
            .eq("user_id", userId)
            .eq("achievement_id", achievement.id)
            .single()

          if (!existing) {
            // Unlock achievement
            await supabase.from("user_achievements").insert({
              user_id: userId,
              achievement_id: achievement.id,
              progress: achievement.requirement_value,
            })

            // Create notification
            await supabase.from("notifications").insert({
              user_id: userId,
              type: "achievement",
              title: "Achievement Unlocked!",
              message: `You've earned the "${achievement.name}" achievement!`,
              data: { achievement_id: achievement.id },
            })
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking achievements:", error)
  }
}
