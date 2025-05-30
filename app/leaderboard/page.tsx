"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Medal, Crown, TrendingUp, ArrowLeft, Star, Zap } from "lucide-react"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/lib/auth"

export default function Leaderboard() {
  const { user, loading } = useAuth()
  const [leaderboardData, setLeaderboardData] = useState<any>({})
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("weekly")

  useEffect(() => {
    if (user) {
      loadLeaderboard(selectedPeriod)
    }
  }, [user, selectedPeriod])

  const loadLeaderboard = async (period: string) => {
    try {
      setLoadingLeaderboard(true)
      const response = await fetch(`/api/leaderboard?period=${period}&userId=${user?.id}`)
      const data = await response.json()
      setLeaderboardData(data)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-orange-500" />
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-400">
            #{rank}
          </span>
        )
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return rank === 1
        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
        : rank === 2
          ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
          : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
    }
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-20 transition-colors">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">See how you rank against others</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <TabsTrigger value="daily" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPeriod} className="space-y-6">
            {loadingLeaderboard ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
              </div>
            ) : leaderboardData.leaderboard && leaderboardData.leaderboard.length > 0 ? (
              <>
                {/* Top 3 Podium */}
                {leaderboardData.leaderboard.length >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 text-white border-0 shadow-2xl overflow-hidden relative">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
                      </div>

                      <CardHeader className="relative z-10">
                        <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
                          <Star className="w-6 h-6" />
                          {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Champions
                          <Star className="w-6 h-6" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="grid grid-cols-3 gap-4 items-end">
                          {/* 2nd Place */}
                          <motion.div
                            className="text-center"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-3 h-24 flex flex-col justify-end border border-white/30">
                              <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-white shadow-lg">
                                <AvatarImage
                                  src={leaderboardData.leaderboard[1].avatar_url || "/placeholder.svg"}
                                  alt={leaderboardData.leaderboard[1].name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                                  {leaderboardData.leaderboard[1].name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <Medal className="w-6 h-6 text-gray-300 mx-auto" />
                            </div>
                            <h3 className="font-semibold">{leaderboardData.leaderboard[1].name}</h3>
                            <p className="text-sm opacity-90">
                              {leaderboardData.leaderboard[1].total_steps.toLocaleString()} steps
                            </p>
                          </motion.div>

                          {/* 1st Place */}
                          <motion.div
                            className="text-center"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-3 h-32 flex flex-col justify-end border border-white/30 relative">
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                                  CHAMPION
                                </div>
                              </div>
                              <Avatar className="w-20 h-20 mx-auto mb-2 border-4 border-yellow-300 shadow-xl">
                                <AvatarImage
                                  src={leaderboardData.leaderboard[0].avatar_url || "/placeholder.svg"}
                                  alt={leaderboardData.leaderboard[0].name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
                                  {leaderboardData.leaderboard[0].name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <Crown className="w-8 h-8 text-yellow-300 mx-auto" />
                            </div>
                            <h3 className="font-bold text-lg">{leaderboardData.leaderboard[0].name}</h3>
                            <p className="text-sm opacity-90">
                              {leaderboardData.leaderboard[0].total_steps.toLocaleString()} steps
                            </p>
                          </motion.div>

                          {/* 3rd Place */}
                          <motion.div
                            className="text-center"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-3 h-20 flex flex-col justify-end border border-white/30">
                              <Avatar className="w-14 h-14 mx-auto mb-2 border-2 border-white shadow-lg">
                                <AvatarImage
                                  src={leaderboardData.leaderboard[2].avatar_url || "/placeholder.svg"}
                                  alt={leaderboardData.leaderboard[2].name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                                  {leaderboardData.leaderboard[2].name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <Medal className="w-5 h-5 text-orange-400 mx-auto" />
                            </div>
                            <h3 className="font-semibold">{leaderboardData.leaderboard[2].name}</h3>
                            <p className="text-sm opacity-90">
                              {leaderboardData.leaderboard[2].total_steps.toLocaleString()} steps
                            </p>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Full Leaderboard */}
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <TrendingUp className="w-5 h-5" />
                        {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Rankings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {leaderboardData.leaderboard.map((user: any, index: number) => (
                          <motion.div
                            key={user.user_id}
                            variants={itemVariants}
                            className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:shadow-md ${
                              user.user_id === user?.id
                                ? "bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800"
                                : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-10 h-10">{getRankIcon(index + 1)}</div>
                              <Avatar className="w-12 h-12 border-2 border-white dark:border-gray-700 shadow-sm">
                                <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                  {user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                                  {user.user_id === user?.id && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                    >
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {user.total_steps.toLocaleString()} steps • {(user.total_distance || 0).toFixed(1)} km
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getRankBadge(index + 1)}>#{index + 1}</Badge>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {Math.round(user.total_calories || 0)} cal
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            ) : (
              <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                <CardContent className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Start tracking your steps to see rankings!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  )
}
