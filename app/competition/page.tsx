"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Calendar, Target, Medal, Crown, ArrowLeft, Star, FlameIcon as Fire } from "lucide-react"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/lib/auth"

export default function Competition() {
  const { user, loading } = useAuth()
  const [competitions, setCompetitions] = useState([])
  const [loadingCompetitions, setLoadingCompetitions] = useState(true)
  const [joiningCompetition, setJoiningCompetition] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadCompetitions()
    }
  }, [user])

  const loadCompetitions = async () => {
    try {
      setLoadingCompetitions(true)
      const response = await fetch(`/api/competitions?userId=${user?.id}&active=true`)
      const data = await response.json()
      setCompetitions(data.competitions || [])
    } catch (error) {
      console.error("Error loading competitions:", error)
    } finally {
      setLoadingCompetitions(false)
    }
  }

  const handleJoinCompetition = async (competitionId: string) => {
    if (!user) return

    try {
      setJoiningCompetition(competitionId)
      const response = await fetch("/api/competitions/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          competitionId,
        }),
      })

      if (response.ok) {
        // Reload competitions to update the UI
        await loadCompetitions()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to join competition")
      }
    } catch (error) {
      console.error("Error joining competition:", error)
      alert("Failed to join competition")
    } finally {
      setJoiningCompetition(null)
    }
  }

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading competitions...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-20 transition-colors">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Competitions</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Challenge yourself and others</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
          {/* Featured Competition */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 dark:from-yellow-500 dark:via-orange-600 dark:to-red-600 text-white border-0 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
              </div>

              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Crown className="w-7 h-7" />
                    Weekly Champion Challenge
                  </CardTitle>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    <Star className="w-4 h-4 mr-1" />
                    Featured
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-lg mb-4 opacity-90">
                      Join thousands of participants in the ultimate step challenge. Top winners get exclusive rewards!
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <Target className="w-4 h-4" />
                        <span className="text-sm">100K steps</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">7 days left</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <Fire className="w-4 h-4" />
                        <span className="text-sm">Hot</span>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="bg-white text-orange-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => handleJoinCompetition("featured")}
                      disabled={joiningCompetition === "featured"}
                    >
                      <Trophy className="w-5 h-5 mr-2" />
                      {joiningCompetition === "featured" ? "Joining..." : "Join Challenge"}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Medal className="w-5 h-5" />
                      Rewards
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <Medal className="w-5 h-5 text-yellow-300" />
                        <span className="text-sm">1st Place: Premium Fitness Tracker</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <Medal className="w-5 h-5 text-gray-300" />
                        <span className="text-sm">2nd-3rd: Wireless Earbuds</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <Medal className="w-5 h-5 text-orange-300" />
                        <span className="text-sm">4th-10th: Gift Cards</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Available Competitions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Available Competitions</h2>

            {loadingCompetitions ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading competitions...</p>
              </div>
            ) : competitions.length > 0 ? (
              <div className="space-y-4">
                {competitions.map((competition: any, index) => (
                  <motion.div
                    key={competition.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-xl ${
                                competition.difficulty === "Easy"
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : competition.difficulty === "Medium"
                                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                                    : "bg-red-100 dark:bg-red-900/30"
                              }`}
                            >
                              <Trophy
                                className={`w-6 h-6 ${
                                  competition.difficulty === "Easy"
                                    ? "text-green-600 dark:text-green-400"
                                    : competition.difficulty === "Medium"
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-red-600 dark:text-red-400"
                                }`}
                              />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {competition.name}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">{competition.description}</p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              competition.difficulty === "Easy"
                                ? "secondary"
                                : competition.difficulty === "Medium"
                                  ? "default"
                                  : "destructive"
                            }
                            className="shrink-0"
                          >
                            {competition.difficulty}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Goal</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {competition.goal.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Participants</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{competition.participants}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Duration</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {Math.ceil(
                                  (new Date(competition.end_date).getTime() - new Date().getTime()) /
                                    (1000 * 60 * 60 * 24),
                                )}{" "}
                                days
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(competition.start_date).toLocaleDateString()} -{" "}
                            {new Date(competition.end_date).toLocaleDateString()}
                          </div>

                          <AnimatePresence>
                            {competition.isJoined ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded-lg"
                              >
                                <Trophy className="w-4 h-4" />
                                <span className="font-semibold text-sm">Joined</span>
                              </motion.div>
                            ) : (
                              <Button
                                onClick={() => handleJoinCompetition(competition.id)}
                                disabled={joiningCompetition === competition.id}
                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              >
                                {joiningCompetition === competition.id ? "Joining..." : "Join Competition"}
                              </Button>
                            )}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                <CardContent className="text-center py-8">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Competitions</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Check back later for new challenges!</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  )
}
