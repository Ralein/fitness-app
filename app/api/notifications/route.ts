import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    const { data: notifications, error } = await query

    if (error) throw error

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, isRead } = body

    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ is_read: isRead })
      .eq("id", notificationId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ notification })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, data } = body

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
