import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get all achievements with user progress
    const { data: achievements, error } = await supabase
      .from("achievements")
      .select(`
        *,
        user_achievements(unlocked_at, progress)
      `)
      .eq("user_achievements.user_id", userId)
      .order("created_at")

    if (error) throw error

    // Also get achievements user hasn't unlocked
    const { data: allAchievements, error: allError } = await supabase
      .from("achievements")
      .select("*")
      .order("created_at")

    if (allError) throw allError

    // Merge data
    const mergedAchievements = allAchievements.map((achievement) => {
      const userAchievement = achievements.find((a) => a.id === achievement.id)
      return {
        ...achievement,
        unlocked: !!userAchievement?.user_achievements?.[0],
        unlocked_at: userAchievement?.user_achievements?.[0]?.unlocked_at,
        progress: userAchievement?.user_achievements?.[0]?.progress || 0,
      }
    })

    return NextResponse.json({ achievements: mergedAchievements })
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, achievementId, progress } = body

    if (!userId || !achievementId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if achievement exists
    const { data: achievement, error: achError } = await supabase
      .from("achievements")
      .select("*")
      .eq("id", achievementId)
      .single()

    if (achError) throw achError

    // Upsert user achievement
    const { data: userAchievement, error } = await supabase
      .from("user_achievements")
      .upsert(
        {
          user_id: userId,
          achievement_id: achievementId,
          progress: progress || achievement.requirement_value,
        },
        {
          onConflict: "user_id,achievement_id",
        },
      )
      .select()
      .single()

    if (error) throw error

    // Create notification if newly unlocked
    if (progress >= achievement.requirement_value) {
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "achievement",
        title: "Achievement Unlocked!",
        message: `You've earned the "${achievement.name}" achievement!`,
        data: { achievement_id: achievementId },
      })
    }

    return NextResponse.json({ userAchievement })
  } catch (error) {
    console.error("Error updating achievement:", error)
    return NextResponse.json({ error: "Failed to update achievement" }, { status: 500 })
  }
}
