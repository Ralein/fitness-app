"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Settings,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Award,
  Flame,
  ArrowLeft,
  Edit3,
  Share2,
  Bell,
  Shield,
  Smartphone,
  Globe,
  Camera,
  MapPin,
  Activity,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/lib/auth"

export default function Profile() {
  const { user, loading, signOut } = useAuth()
  const [userStats, setUserStats] = useState<any>({})
  const [achievements, setAchievements] = useState([])
  const [weeklyProgress, setWeeklyProgress] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  // Helper functions for safe user data handling
  const getUserDisplayName = () => {
    if (user?.name) return user.name
    if (user?.email) return user.email.split("@")[0]
    return "User"
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    if (name === "User") return "U"

    const words = name.split(" ")
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoadingData(true)

      // Load user's steps for the past week
      const endDate = new Date().toISOString().split("T")[0]
      const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      const stepsResponse = await fetch(`/api/steps?userId=${user?.id}&startDate=${startDate}&endDate=${endDate}`)
      const stepsData = await stepsResponse.json()

      // Process weekly progress
      const weekData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split("T")[0]
        const dayData = stepsData.steps?.find((s: any) => s.date === dateStr)

        weekData.push({
          day: date.toLocaleDateString("en", { weekday: "short" }),
          steps: dayData?.step_count || 0,
          goal: user?.daily_goal || 10000,
        })
      }
      setWeeklyProgress(weekData)

      // Calculate user stats
      const totalSteps = stepsData.steps?.reduce((sum: number, day: any) => sum + day.step_count, 0) || 0
      const totalDistance = stepsData.steps?.reduce((sum: number, day: any) => sum + day.distance, 0) || 0
      const totalCalories = stepsData.steps?.reduce((sum: number, day: any) => sum + day.calories, 0) || 0
      const activeDays = stepsData.steps?.filter((day: any) => day.step_count > 0).length || 0

      setUserStats({
        totalSteps,
        totalDistance,
        totalCalories,
        activeDays,
        currentStreak: 7, // This would need more complex calculation
        longestStreak: 23, // This would need more complex calculation
        averageDaily: Math.round(totalSteps / 7),
        weeklyGoal: user?.weekly_goal || 70000,
        monthlyGoal: user?.monthly_goal || 300000,
        joinDate: new Date(user?.created_at || Date.now()).toLocaleDateString("en", { month: "long", year: "numeric" }),
      })

      // Load achievements
      const achievementsResponse = await fetch(`/api/achievements?userId=${user?.id}`)
      const achievementsData = await achievementsResponse.json()
      setAchievements(achievementsData.achievements || [])
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
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
        staggerChildren: 0.1,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-20 transition-colors">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your fitness journey</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
          {/* Enhanced Profile Header */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white border-0 shadow-2xl overflow-hidden relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
              </div>

              <CardContent className="p-6 relative z-10">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={getUserDisplayName()} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{getUserDisplayName()}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm opacity-90 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>Location</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {userStats.joinDate || "Recently"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{userStats.currentStreak || 0}</p>
                        <p className="text-xs opacity-90">Day Streak</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{Math.round(userStats.totalDistance || 0)}</p>
                        <p className="text-xs opacity-90">Total KM</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{achievements.filter((a: any) => a.unlocked).length}</p>
                        <p className="text-xs opacity-90">Achievements</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                >
                  Awards
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                >
                  Stats
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                >
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {loadingData ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
                  </div>
                ) : (
                  <>
                    {/* Weekly Progress */}
                    <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          This Week's Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {weeklyProgress.map((day, index) => (
                            <div key={day.day} className="flex items-center gap-4">
                              <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">{day.day}</div>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-900 dark:text-white">
                                    {day.steps.toLocaleString()} steps
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {Math.round((day.steps / day.goal) * 100)}%
                                  </span>
                                </div>
                                <Progress value={(day.steps / day.goal) * 100} className="h-2" />
                              </div>
                              {day.steps >= day.goal && <Trophy className="w-4 h-4 text-yellow-500" />}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white border-0">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                              <Target className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs opacity-90">Weekly Goal</p>
                              <p className="text-xl font-bold">
                                {Math.round(
                                  (weeklyProgress.reduce((sum, day) => sum + day.steps, 0) /
                                    (userStats.weeklyGoal || 70000)) *
                                    100,
                                )}
                                %
                              </p>
                              <p className="text-xs opacity-75">
                                {weeklyProgress.reduce((sum, day) => sum + day.steps, 0).toLocaleString()} /{" "}
                                {(userStats.weeklyGoal || 70000).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 text-white border-0">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                              <Flame className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs opacity-90">Current Streak</p>
                              <p className="text-xl font-bold">{userStats.currentStreak || 0} days</p>
                              <p className="text-xs opacity-75">Keep it up!</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Achievements ({achievements.filter((a: any) => a.unlocked).length}/{achievements.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingData ? (
                      <div className="text-center py-4">
                        <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading achievements...</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {achievements.map((achievement: any) => (
                          <motion.div
                            key={achievement.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                              achievement.unlocked
                                ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800"
                                : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className={`text-3xl ${achievement.unlocked ? "" : "grayscale opacity-50"}`}>
                              {achievement.icon || "🏆"}
                            </div>
                            <div className="flex-1">
                              <h3
                                className={`font-semibold ${achievement.unlocked ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                              >
                                {achievement.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                              {achievement.unlocked && achievement.unlocked_at && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                  Unlocked on {new Date(achievement.unlocked_at).toLocaleDateString()}
                                </p>
                              )}
                              {!achievement.unlocked && achievement.progress > 0 && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {Math.round((achievement.progress / achievement.requirement_value) * 100)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={(achievement.progress / achievement.requirement_value) * 100}
                                    className="h-1"
                                  />
                                </div>
                              )}
                            </div>
                            {achievement.unlocked && (
                              <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                <Trophy className="w-3 h-3 mr-1" />
                                Unlocked
                              </Badge>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Total Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userStats.totalSteps?.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">This week</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Distance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userStats.totalDistance?.toFixed(1) || "0"} km
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">This week</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Calories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userStats.totalCalories?.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Burned this week</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Active Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.activeDays || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">This week</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Daily Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Activity className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {userStats.averageDaily?.toLocaleString() || "0"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">steps per day</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Daily reminders and achievements</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Privacy</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Control your data sharing</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Connected Devices</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Sync with fitness trackers</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Goals</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Set your daily and weekly targets</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Account</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="w-4 h-4 mr-2" />
                      Language & Region
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  )
}
