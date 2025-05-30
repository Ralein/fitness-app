"use client"

export class PushNotificationManager {
  private static instance: PushNotificationManager
  private registration: ServiceWorkerRegistration | null = null

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager()
    }
    return PushNotificationManager.instance
  }

  async initialize(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications not supported")
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service Worker registered")
      return true
    } catch (error) {
      console.error("Service Worker registration failed:", error)
      return false
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported")
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  async subscribe(userId: string): Promise<boolean> {
    // For now, use local notifications instead of push notifications
    console.log("Using local notifications instead of push notifications")
    return true
  }

  async unsubscribe(userId: string): Promise<boolean> {
    console.log("Unsubscribed from local notifications")
    return true
  }

  // Show local notification (works without VAPID keys)
  showNotification(title: string, options: NotificationOptions = {}): void {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        icon: "/icon-192.png",
        badge: "/badge-72.png",
        ...options,
      })
    }
  }

  // Show achievement notification
  showAchievementNotification(achievementName: string): void {
    this.showNotification("🏆 Achievement Unlocked!", {
      body: `You've earned: ${achievementName}`,
      icon: "/icon-192.png",
      tag: "achievement",
    })
  }

  // Show daily goal notification
  showDailyGoalNotification(steps: number, goal: number): void {
    if (steps >= goal) {
      this.showNotification("🎯 Daily Goal Achieved!", {
        body: `Congratulations! You've reached ${steps} steps today!`,
        icon: "/icon-192.png",
        tag: "daily-goal",
      })
    }
  }
}

export function usePushNotifications() {
  const manager = PushNotificationManager.getInstance()

  return {
    initialize: () => manager.initialize(),
    requestPermission: () => manager.requestPermission(),
    subscribe: (userId: string) => manager.subscribe(userId),
    unsubscribe: (userId: string) => manager.unsubscribe(userId),
    showNotification: (title: string, options?: NotificationOptions) => manager.showNotification(title, options),
    showAchievementNotification: (name: string) => manager.showAchievementNotification(name),
    showDailyGoalNotification: (steps: number, goal: number) => manager.showDailyGoalNotification(steps, goal),
  }
}
