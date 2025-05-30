import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, subscription } = body

    if (!userId || !subscription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { endpoint, keys } = subscription

    // Store subscription in database
    const { data: pushSubscription, error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        {
          onConflict: "user_id,endpoint",
        },
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, pushSubscription })
  } catch (error) {
    console.error("Error subscribing to push notifications:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
