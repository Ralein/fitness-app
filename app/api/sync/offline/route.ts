import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, data } = body

    if (!userId || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Process different types of offline data
    const results = []

    // Sync steps data
    if (data.steps && Array.isArray(data.steps)) {
      for (const stepData of data.steps) {
        const { data: steps, error } = await supabase
          .from("steps")
          .upsert(
            {
              user_id: userId,
              date: stepData.date,
              step_count: stepData.stepCount,
              distance: stepData.distance,
              calories: stepData.calories,
              active_minutes: stepData.activeMinutes,
            },
            {
              onConflict: "user_id,date",
            },
          )
          .select()

        if (error) {
          console.error("Error syncing steps:", error)
        } else {
          results.push({ type: "steps", success: true, data: steps })
        }
      }
    }

    // Sync activity sessions
    if (data.sessions && Array.isArray(data.sessions)) {
      for (const session of data.sessions) {
        const { data: activitySession, error } = await supabase
          .from("activity_sessions")
          .insert({
            user_id: userId,
            activity_type: session.activityType,
            start_time: session.startTime,
            end_time: session.endTime,
            steps: session.steps,
            distance: session.distance,
            calories: session.calories,
            route_data: session.routeData,
          })
          .select()

        if (error) {
          console.error("Error syncing session:", error)
        } else {
          results.push({ type: "session", success: true, data: activitySession })
        }
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error syncing offline data:", error)
    return NextResponse.json({ error: "Failed to sync offline data" }, { status: 500 })
  }
}
