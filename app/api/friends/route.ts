import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status") || "accepted"

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: friends, error } = await supabase
      .from("friends")
      .select(`
        *,
        friend:users!friends_friend_id_fkey(id, name, avatar_url),
        user:users!friends_user_id_fkey(id, name, avatar_url)
      `)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Format friends list
    const friendsList = friends.map((friendship) => {
      const friend = friendship.user_id === userId ? friendship.friend : friendship.user
      return {
        ...friendship,
        friend,
      }
    })

    return NextResponse.json({ friends: friendsList })
  } catch (error) {
    console.error("Error fetching friends:", error)
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, friendId, action } = body

    if (!userId || !friendId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (action === "request") {
      // Send friend request
      const { data: friendship, error } = await supabase
        .from("friends")
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      // Create notification
      await supabase.from("notifications").insert({
        user_id: friendId,
        type: "friend_request",
        title: "New Friend Request",
        message: "Someone wants to be your friend!",
        data: { from_user_id: userId },
      })

      return NextResponse.json({ friendship })
    }

    if (action === "accept") {
      // Accept friend request
      const { data: friendship, error } = await supabase
        .from("friends")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("user_id", friendId)
        .eq("friend_id", userId)
        .eq("status", "pending")
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ friendship })
    }

    if (action === "decline" || action === "remove") {
      // Decline request or remove friend
      const { error } = await supabase
        .from("friends")
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error managing friendship:", error)
    return NextResponse.json({ error: "Failed to manage friendship" }, { status: 500 })
  }
}
