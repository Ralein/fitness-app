"use client"

export class StepTracker {
  private static instance: StepTracker
  private isTracking = false
  private stepCount = 0
  private lastTimestamp = 0
  private callbacks: ((steps: number) => void)[] = []

  static getInstance(): StepTracker {
    if (!StepTracker.instance) {
      StepTracker.instance = new StepTracker()
    }
    return StepTracker.instance
  }

  // Request permission for device motion (iOS 13+)
  async requestPermission(): Promise<boolean> {
    if (typeof DeviceMotionEvent !== "undefined" && "requestPermission" in DeviceMotionEvent) {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission()
        return permission === "granted"
      } catch (error) {
        console.error("Permission request failed:", error)
        return false
      }
    }
    return true // Android or older iOS
  }

  // Start step tracking using device motion
  async startTracking(): Promise<boolean> {
    if (this.isTracking) return true

    const hasPermission = await this.requestPermission()
    if (!hasPermission) {
      console.error("Motion permission denied")
      return false
    }

    if ("DeviceMotionEvent" in window) {
      this.isTracking = true
      this.lastTimestamp = Date.now()

      window.addEventListener("devicemotion", this.handleDeviceMotion.bind(this))
      console.log("Step tracking started")
      return true
    } else {
      console.error("DeviceMotionEvent not supported")
      return false
    }
  }

  stopTracking(): void {
    if (!this.isTracking) return

    this.isTracking = false
    window.removeEventListener("devicemotion", this.handleDeviceMotion.bind(this))
    console.log("Step tracking stopped")
  }

  private handleDeviceMotion(event: DeviceMotionEvent): void {
    if (!this.isTracking || !event.accelerationIncludingGravity) return

    const { x, y, z } = event.accelerationIncludingGravity
    if (x === null || y === null || z === null) return

    // Simple step detection algorithm
    const acceleration = Math.sqrt(x * x + y * y + z * z)
    const threshold = 12 // Adjust based on testing
    const now = Date.now()

    // Prevent double counting (minimum 300ms between steps)
    if (acceleration > threshold && now - this.lastTimestamp > 300) {
      this.stepCount++
      this.lastTimestamp = now
      this.notifyCallbacks()
    }
  }

  // Alternative: Use Web API for step counting (if available)
  async useWebAPI(): Promise<boolean> {
    if ("navigator" in window && "permissions" in navigator) {
      try {
        // Check for step counter permission (experimental)
        const permission = await navigator.permissions.query({ name: "accelerometer" as PermissionName })
        if (permission.state === "granted") {
          // Use Sensor APIs if available
          if ("Accelerometer" in window) {
            const sensor = new (window as any).Accelerometer({ frequency: 60 })
            sensor.addEventListener("reading", () => {
              // Process accelerometer data for step detection
            })
            sensor.start()
            return true
          }
        }
      } catch (error) {
        console.error("Web API not available:", error)
      }
    }
    return false
  }

  // Simulate step tracking for demo purposes
  startSimulation(): void {
    if (this.isTracking) return

    this.isTracking = true
    const interval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(interval)
        return
      }

      // Simulate 1-5 steps every 2 seconds
      const newSteps = Math.floor(Math.random() * 5) + 1
      this.stepCount += newSteps
      this.notifyCallbacks()
    }, 2000)
  }

  getStepCount(): number {
    return this.stepCount
  }

  resetStepCount(): void {
    this.stepCount = 0
    this.notifyCallbacks()
  }

  onStepUpdate(callback: (steps: number) => void): void {
    this.callbacks.push(callback)
  }

  removeCallback(callback: (steps: number) => void): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback)
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach((callback) => callback(this.stepCount))
  }

  // Save steps to server
  async saveSteps(userId: string): Promise<boolean> {
    try {
      const response = await fetch("/api/steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          steps: this.stepCount,
          timestamp: Date.now(),
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Failed to save steps:", error)
      return false
    }
  }
}

// Hook for using step tracker in React components
export function useStepTracker() {
  const tracker = StepTracker.getInstance()

  return {
    startTracking: () => tracker.startTracking(),
    stopTracking: () => tracker.stopTracking(),
    startSimulation: () => tracker.startSimulation(),
    getStepCount: () => tracker.getStepCount(),
    resetStepCount: () => tracker.resetStepCount(),
    onStepUpdate: (callback: (steps: number) => void) => tracker.onStepUpdate(callback),
    removeCallback: (callback: (steps: number) => void) => tracker.removeCallback(callback),
    saveSteps: (userId: string) => tracker.saveSteps(userId),
  }
}
