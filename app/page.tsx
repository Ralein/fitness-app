"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Activity, Target, Trophy, Users, TrendingUp, Bell, Settings } from "lucide-react"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { StepTracker } from "@/components/step-tracker"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/lib/auth"
import { useDeviceMotion } from "@/lib/device-motion"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const deviceMotion = useDeviceMotion()

  const [todaySteps, setTodaySteps] = useState(0)
  const [competitions, setCompetitions] = useState([])
  const [stepGoal, setStepGoal] = useState(10000)
  const [isTracking, setIsTracking] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      loadUserData()
      loadTodaySteps()
      setupStepTracking()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoadingData(true)

      // Load user's competitions
      const competitionsResponse = await fetch(`/api/competitions?userId=${user?.id}&joined=true`)
      const competitionsData = await competitionsResponse.json()
      setCompetitions(competitionsData.competitions || [])

      // Set user's daily goal
      if (user?.daily_goal) {
        setStepGoal(user.daily_goal)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const loadTodaySteps = async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(`/api/steps?userId=${user.id}&date=${today}`)
      const data = await response.json()

      if (data.steps) {
        setTodaySteps(data.steps.step_count)
        deviceMotion.setStepCount(data.steps.step_count)
      }
    } catch (error) {
      console.error("Error loading today's steps:", error)
    }
  }

  const setupStepTracking = () => {
    // Set up step tracking callback
    const handleStepUpdate = (steps: number) => {
      setTodaySteps(steps)
      // Auto-save every 10 steps
      if (steps % 10 === 0 && user) {
        saveSteps(steps)
      }
    }

    deviceMotion.onStepUpdate(handleStepUpdate)

    return () => {
      deviceMotion.removeCallback(handleStepUpdate)
    }
  }

  const saveSteps = async (steps: number) => {
    if (!user) return

    try {
      const today = new Date().toISOString().split("T")[0]
      await fetch("/api/steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          date: today,
          stepCount: steps,
          distance: steps * 0.0008, // Rough estimate
          calories: Math.round(steps * 0.04),
          activeMinutes: Math.round(steps * 0.01),
        }),
      })
    } catch (error) {
      console.error("Error saving steps:", error)
    }
  }

  const handleToggleTracking = async () => {
    if (!isTracking) {
      const success = await deviceMotion.startTracking()
      if (success) {
        setIsTracking(true)
      } else {
        // Fallback to simulation for demo
        deviceMotion.startSimulation()
        setIsTracking(true)
      }
    } else {
      deviceMotion.stopTracking()
      setIsTracking(false)
      // Save final step count
      if (user) {
        await saveSteps(todaySteps)
      }
    }
  }

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading FitStep...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />
  }

  // Safe name extraction
  const getUserDisplayName = () => {
    if (user.name) {
      return user.name.split(" ")[0]
    }
    if (user.email) {
      return user.email.split("@")[0]
    }
    return "there"
  }

  // Safe initials extraction
  const getUserInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const stepProgress = (todaySteps / stepGoal) * 100

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-20 transition-colors">
      {/* Enhanced Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-800 ring-2 ring-blue-100 dark:ring-blue-900">
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name || user.email || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Hi, {getUserDisplayName()}!</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Let's crush your goals today</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-gray-950 rounded-full animate-pulse"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
          {/* Enhanced Step Tracker */}
          <motion.div variants={itemVariants}>
            <StepTracker
              steps={todaySteps}
              goal={stepGoal}
              isTracking={isTracking}
              onToggleTracking={handleToggleTracking}
            />
          </motion.div>

          {/* Enhanced Quick Stats */}
          <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs opacity-90 font-medium">Calories Burned</p>
                    <p className="text-xl font-bold">{Math.round(todaySteps * 0.04)}</p>
                    <p className="text-xs opacity-75">Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs opacity-90 font-medium">Distance</p>
                    <p className="text-xl font-bold">{(todaySteps * 0.0008).toFixed(1)} km</p>
                    <p className="text-xs opacity-75">Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Active Competitions */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    Active Challenges
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <Link href="/competition">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingData ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading competitions...</p>
                  </div>
                ) : competitions.length > 0 ? (
                  competitions.slice(0, 2).map((competition: any, index) => (
                    <motion.div
                      key={competition.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{competition.name}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {competition.participants} participants
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      >
                        Active
                      </Badge>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">No active competitions</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/competition">Join a Challenge</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900 dark:hover:to-blue-900 transition-all duration-300"
                    asChild
                  >
                    <Link href="/competition">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium">Join Challenge</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900 dark:hover:to-emerald-900 transition-all duration-300"
                    asChild
                  >
                    <Link href="/leaderboard">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium">Leaderboard</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900 dark:hover:to-red-900 transition-all duration-300"
                  >
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium">Set Goal</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900 dark:hover:to-cyan-900 transition-all duration-300"
                  >
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium">Find Friends</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
