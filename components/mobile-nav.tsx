"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, Trophy, TrendingUp, User, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/competition", icon: Trophy, label: "Compete" },
    { href: "/leaderboard", icon: TrendingUp, label: "Rankings" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 safe-area-pb transition-colors">
      <div className="flex items-center justify-around px-6 py-3 mx-4 mb-2 bg-white/20 dark:bg-white/5 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className={`flex-col gap-1 h-16 w-16 relative transition-all duration-200 ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
              asChild
            >
              <Link href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.div>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </Button>
          )
        })}

        {/* Enhanced Floating Action Button */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 border-4 border-white dark:border-gray-950"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
