"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Footprints, Zap, FlameIcon as Fire } from "lucide-react"

interface StepTrackerProps {
  steps: number
  goal: number
  isTracking: boolean
  onToggleTracking: () => void
}

export function StepTracker({ steps, goal, isTracking, onToggleTracking }: StepTrackerProps) {
  const progress = (steps / goal) * 100
  const circumference = 2 * Math.PI * 90
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <Card className="bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 dark:from-blue-700 dark:via-purple-800 dark:to-pink-700 text-white border-0 shadow-2xl overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
      </div>

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Today's Steps</h2>
            <p className="text-sm opacity-90">You're doing amazing!</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Footprints className="w-4 h-4 mr-1" />
              {isTracking ? "Live" : "Paused"}
            </Badge>
            {isTracking && (
              <Badge
                variant="secondary"
                className="bg-green-500/20 text-green-100 border-green-400/30 backdrop-blur-sm animate-pulse"
              >
                <Zap className="w-4 h-4 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </div>

        {/* Enhanced Circular Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
              {/* Progress circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>

            {/* Enhanced Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="text-4xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              >
                {steps.toLocaleString()}
              </motion.div>
              <div className="text-sm opacity-90 mb-1">of {goal.toLocaleString()}</div>
              <div className="text-xs opacity-75 mb-2">{Math.round(progress)}% complete</div>
              {progress >= 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-yellow-300"
                >
                  <Fire className="w-4 h-4" />
                  <span className="text-xs font-semibold">Goal Achieved!</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Control Button */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={onToggleTracking}
            size="lg"
            className={`${
              isTracking
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/25"
                : "bg-green-500 hover:bg-green-600 shadow-green-500/25"
            } text-white border-0 px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
          >
            {isTracking ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause Tracking
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Tracking
              </>
            )}
          </Button>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Fire className="w-4 h-4 mr-1 text-orange-300" />
            </div>
            <p className="text-2xl font-bold">{Math.round(steps * 0.04)}</p>
            <p className="text-xs opacity-90">Calories</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Footprints className="w-4 h-4 mr-1 text-blue-300" />
            </div>
            <p className="text-2xl font-bold">{(steps * 0.0008).toFixed(1)}</p>
            <p className="text-xs opacity-90">Kilometers</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="w-4 h-4 mr-1 text-green-300" />
            </div>
            <p className="text-2xl font-bold">{Math.round(steps * 0.5)}</p>
            <p className="text-xs opacity-90">Minutes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
