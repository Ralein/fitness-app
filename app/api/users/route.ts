import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const email = searchParams.get("email")

    if (userId) {
      const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle() // Use maybeSingle instead of single to handle no rows

      if (error) {
        console.error("Error fetching user by ID:", error)
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
      }

      if (!user) {
        return NextResponse.json({ user: null }, { status: 404 })
      }

      return NextResponse.json({ user })
    }

    if (email) {
      const { data: user, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle() // Use maybeSingle instead of single

      if (error) {
        console.error("Error fetching user by email:", error)
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
      }

      if (!user) {
        return NextResponse.json({ user: null }, { status: 404 })
      }

      return NextResponse.json({ user })
    }

    // Get all users (for leaderboard)
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, avatar_url")
      .eq("privacy_level", "public")
      .limit(100)

    if (error) {
      console.error("Error fetching all users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error("Error in users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, avatar_url, daily_goal, timezone } = body

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).maybeSingle()

    if (existingUser) {
      return NextResponse.json({ user: existingUser }, { status: 200 })
    }

    // Create new user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        avatar_url,
        daily_goal: daily_goal || 10000,
        timezone: timezone || "UTC",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Error in POST users API:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...updates } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data: user, error } = await supabase.from("users").update(updates).eq("id", userId).select().maybeSingle()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error in PUT users API:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
