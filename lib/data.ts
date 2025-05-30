export interface User {
  id: string
  name: string
  avatar: string
  steps: number
  streak: number
}

export interface Competition {
  id: string
  name: string
  description: string
  goal: number
  participants: number
  duration: string
  difficulty: "Easy" | "Medium" | "Hard"
  progress: number
  isJoined: boolean
  userRank: number
  daysLeft: number
  topParticipants: User[]
}

export interface LeaderboardData {
  daily: User[]
  weekly: User[]
  monthly: User[]
}

// Mock current user
export const getCurrentUser = (): User => ({
  id: "current-user",
  name: "Alex Johnson",
  avatar: "/placeholder.svg?height=40&width=40",
  steps: 8547,
  streak: 7,
})

// Mock today's steps
export const getTodaySteps = (): number => 8547

// Mock active competitions
export const getActiveCompetitions = (): Competition[] => [
  {
    id: "comp-1",
    name: "Weekend Warriors",
    description: "Weekend step challenge",
    goal: 20000,
    participants: 156,
    duration: "3 days",
    difficulty: "Medium",
    progress: 67,
    isJoined: true,
    userRank: 12,
    daysLeft: 2,
    topParticipants: [
      { id: "1", name: "Sarah M.", avatar: "/placeholder.svg?height=32&width=32", steps: 18500, streak: 5 },
      { id: "2", name: "Mike R.", avatar: "/placeholder.svg?height=32&width=32", steps: 17800, streak: 3 },
      { id: "3", name: "Lisa K.", avatar: "/placeholder.svg?height=32&width=32", steps: 16900, streak: 8 },
    ],
  },
  {
    id: "comp-2",
    name: "Daily 10K Club",
    description: "Reach 10,000 steps daily",
    goal: 10000,
    participants: 89,
    duration: "7 days",
    difficulty: "Easy",
    progress: 85,
    isJoined: true,
    userRank: 8,
    daysLeft: 5,
    topParticipants: [
      { id: "4", name: "Tom W.", avatar: "/placeholder.svg?height=32&width=32", steps: 12500, streak: 12 },
      { id: "5", name: "Emma S.", avatar: "/placeholder.svg?height=32&width=32", steps: 11800, streak: 6 },
      { id: "6", name: "David L.", avatar: "/placeholder.svg?height=32&width=32", steps: 11200, streak: 4 },
    ],
  },
]

// Mock available competitions
export const getAvailableCompetitions = (): Competition[] => [
  {
    id: "comp-3",
    name: "Marathon Month",
    description: "Complete a marathon distance in steps over 30 days",
    goal: 42195,
    participants: 234,
    duration: "30 days",
    difficulty: "Hard",
    progress: 23,
    isJoined: false,
    userRank: 0,
    daysLeft: 25,
    topParticipants: [
      { id: "7", name: "Runner A", avatar: "/placeholder.svg?height=32&width=32", steps: 15000, streak: 15 },
      { id: "8", name: "Runner B", avatar: "/placeholder.svg?height=32&width=32", steps: 14500, streak: 10 },
      { id: "9", name: "Runner C", avatar: "/placeholder.svg?height=32&width=32", steps: 14000, streak: 8 },
    ],
  },
  {
    id: "comp-4",
    name: "Team Challenge",
    description: "Work together with your team to reach collective goals",
    goal: 50000,
    participants: 67,
    duration: "14 days",
    difficulty: "Medium",
    progress: 45,
    isJoined: false,
    userRank: 0,
    daysLeft: 10,
    topParticipants: [
      { id: "10", name: "Team Lead", avatar: "/placeholder.svg?height=32&width=32", steps: 13000, streak: 7 },
      { id: "11", name: "Team Member", avatar: "/placeholder.svg?height=32&width=32", steps: 12500, streak: 5 },
      { id: "12", name: "Team Player", avatar: "/placeholder.svg?height=32&width=32", steps: 12000, streak: 9 },
    ],
  },
  {
    id: "comp-5",
    name: "Beginner Boost",
    description: "Perfect for those just starting their fitness journey",
    goal: 5000,
    participants: 145,
    duration: "7 days",
    difficulty: "Easy",
    progress: 78,
    isJoined: false,
    userRank: 0,
    daysLeft: 4,
    topParticipants: [
      { id: "13", name: "Beginner A", avatar: "/placeholder.svg?height=32&width=32", steps: 6500, streak: 3 },
      { id: "14", name: "Beginner B", avatar: "/placeholder.svg?height=32&width=32", steps: 6200, streak: 4 },
      { id: "15", name: "Beginner C", avatar: "/placeholder.svg?height=32&width=32", steps: 5900, streak: 2 },
    ],
  },
]

// Mock leaderboard data
export const getLeaderboardData = (): LeaderboardData => ({
  daily: [],
  weekly: [
    { id: "1", name: "Sarah Mitchell", avatar: "/placeholder.svg?height=40&width=40", steps: 95420, streak: 12 },
    { id: "2", name: "Mike Rodriguez", avatar: "/placeholder.svg?height=40&width=40", steps: 89350, streak: 8 },
    { id: "3", name: "Lisa Kim", avatar: "/placeholder.svg?height=40&width=40", steps: 87240, streak: 15 },
    { id: "4", name: "Tom Wilson", avatar: "/placeholder.svg?height=40&width=40", steps: 84560, streak: 6 },
    { id: "5", name: "Emma Stone", avatar: "/placeholder.svg?height=40&width=40", steps: 82340, streak: 9 },
    { id: "6", name: "David Lee", avatar: "/placeholder.svg?height=40&width=40", steps: 79850, streak: 4 },
    { id: "7", name: "Rachel Green", avatar: "/placeholder.svg?height=40&width=40", steps: 77920, streak: 11 },
    { id: "8", name: "James Brown", avatar: "/placeholder.svg?height=40&width=40", steps: 75680, streak: 7 },
    { id: "9", name: "Maria Garcia", avatar: "/placeholder.svg?height=40&width=40", steps: 73450, streak: 5 },
    { id: "10", name: "Chris Taylor", avatar: "/placeholder.svg?height=40&width=40", steps: 71230, streak: 3 },
    {
      id: "current-user",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      steps: 59829,
      streak: 7,
    },
    { id: "12", name: "Jennifer Davis", avatar: "/placeholder.svg?height=40&width=40", steps: 68940, streak: 8 },
    { id: "13", name: "Robert Miller", avatar: "/placeholder.svg?height=40&width=40", steps: 66750, streak: 2 },
    { id: "14", name: "Amanda White", avatar: "/placeholder.svg?height=40&width=40", steps: 64580, streak: 6 },
    { id: "15", name: "Kevin Johnson", avatar: "/placeholder.svg?height=40&width=40", steps: 62390, streak: 4 },
  ],
  monthly: [],
})

// Mock function to join competition
export const joinCompetition = (competitionId: string): void => {
  console.log(`Joined competition: ${competitionId}`)
}
