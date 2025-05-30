import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const active = searchParams.get("active") === "true"
    const joined = searchParams.get("joined") === "true"

    let query = supabase.from("competitions").select(`
        *,
        user_competitions(user_id, current_progress, rank),
        users!competitions_created_by_fkey(name, avatar_url)
      `)

    if (active) {
      const today = new Date().toISOString().split("T")[0]
      query = query.lte("start_date", today).gte("end_date", today)
    }

    if (joined && userId) {
      query = query
        .select(`
          *,
          user_competitions!inner(user_id, current_progress, rank),
          users!competitions_created_by_fkey(name, avatar_url)
        `)
        .eq("user_competitions.user_id", userId)
    }

    const { data: competitions, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    // Get participant counts
    const competitionsWithCounts = await Promise.all(
      competitions.map(async (competition) => {
        const { count } = await supabase
          .from("user_competitions")
          .select("*", { count: "exact", head: true })
          .eq("competition_id", competition.id)

        return {
          ...competition,
          participants: count || 0,
          isJoined: joined ? true : competition.user_competitions.some((uc: any) => uc.user_id === userId),
        }
      }),
    )

    return NextResponse.json({ competitions: competitionsWithCounts })
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return NextResponse.json({ error: "Failed to fetch competitions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      goal,
      goalType = "steps",
      startDate,
      endDate,
      difficulty,
      maxParticipants,
      isPublic = true,
      createdBy,
      prizeDescription,
    } = body

    if (!name || !goal || !startDate || !endDate || !createdBy) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: competition, error } = await supabase
      .from("competitions")
      .insert({
        name,
        description,
        goal,
        goal_type: goalType,
        start_date: startDate,
        end_date: endDate,
        difficulty,
        max_participants: maxParticipants,
        is_public: isPublic,
        created_by: createdBy,
        prize_description: prizeDescription,
      })
      .select()
      .single()

    if (error) throw error

    // Auto-join creator to competition
    await supabase.from("user_competitions").insert({
      user_id: createdBy,
      competition_id: competition.id,
    })

    return NextResponse.json({ competition }, { status: 201 })
  } catch (error) {
    console.error("Error creating competition:", error)
    return NextResponse.json({ error: "Failed to create competition" }, { status: 500 })
  }
}
