import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, competitionId } = body

    if (!userId || !competitionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if competition exists and is joinable
    const { data: competition, error: compError } = await supabase
      .from("competitions")
      .select("*, user_competitions(count)")
      .eq("id", competitionId)
      .single()

    if (compError) throw compError

    // Check if user already joined
    const { data: existing } = await supabase
      .from("user_competitions")
      .select("id")
      .eq("user_id", userId)
      .eq("competition_id", competitionId)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Already joined this competition" }, { status: 400 })
    }

    // Check max participants
    const { count: currentParticipants } = await supabase
      .from("user_competitions")
      .select("*", { count: "exact", head: true })
      .eq("competition_id", competitionId)

    if (competition.max_participants && currentParticipants >= competition.max_participants) {
      return NextResponse.json({ error: "Competition is full" }, { status: 400 })
    }

    // Join competition
    const { data: userCompetition, error } = await supabase
      .from("user_competitions")
      .insert({
        user_id: userId,
        competition_id: competitionId,
      })
      .select()
      .single()

    if (error) throw error

    // Create notification
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "competition_joined",
      title: "Competition Joined!",
      message: `You've joined "${competition.name}"`,
      data: { competition_id: competitionId },
    })

    return NextResponse.json({ success: true, userCompetition })
  } catch (error) {
    console.error("Error joining competition:", error)
    return NextResponse.json({ error: "Failed to join competition" }, { status: 500 })
  }
}
