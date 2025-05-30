"use client"

import { useState } from "react"

export class DeviceMotionTracker {
  private static instance: DeviceMotionTracker
  private isTracking = false
  private stepCount = 0
  private lastAcceleration = { x: 0, y: 0, z: 0 }
  private lastStepTime = 0
  private callbacks: ((steps: number) => void)[] = []
  private threshold = 12 // Acceleration threshold for step detection
  private minStepInterval = 300 // Minimum time between steps (ms)

  static getInstance(): DeviceMotionTracker {
    if (!DeviceMotionTracker.instance) {
      DeviceMotionTracker.instance = new DeviceMotionTracker()
    }
    return DeviceMotionTracker.instance
  }

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

  async startTracking(): Promise<boolean> {
    if (this.isTracking) return true

    const hasPermission = await this.requestPermission()
    if (!hasPermission) {
      console.error("Motion permission denied")
      return false
    }

    if ("DeviceMotionEvent" in window) {
      this.isTracking = true
      window.addEventListener("devicemotion", this.handleDeviceMotion.bind(this))
      console.log("Device motion tracking started")
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
    console.log("Device motion tracking stopped")
  }

  private handleDeviceMotion(event: DeviceMotionEvent): void {
    if (!this.isTracking || !event.accelerationIncludingGravity) return

    const { x, y, z } = event.accelerationIncludingGravity
    if (x === null || y === null || z === null) return

    // Calculate total acceleration magnitude
    const acceleration = Math.sqrt(x * x + y * y + z * z)
    const now = Date.now()

    // Detect step based on acceleration threshold and timing
    if (acceleration > this.threshold && now - this.lastStepTime > this.minStepInterval) {
      // Additional filtering: check for significant change in acceleration
      const deltaAccel = Math.abs(acceleration - this.lastAcceleration.magnitude)

      if (deltaAccel > 2) {
        // Minimum acceleration change
        this.stepCount++
        this.lastStepTime = now
        this.notifyCallbacks()
      }
    }

    this.lastAcceleration = { x, y, z, magnitude: acceleration } as any
  }

  // Alternative: Use Sensor APIs if available
  async useSensorAPI(): Promise<boolean> {
    if ("Accelerometer" in window) {
      try {
        const sensor = new (window as any).Accelerometer({ frequency: 60 })

        sensor.addEventListener("reading", () => {
          const acceleration = Math.sqrt(sensor.x * sensor.x + sensor.y * sensor.y + sensor.z * sensor.z)

          const now = Date.now()
          if (acceleration > this.threshold && now - this.lastStepTime > this.minStepInterval) {
            this.stepCount++
            this.lastStepTime = now
            this.notifyCallbacks()
          }
        })

        sensor.start()
        this.isTracking = true
        return true
      } catch (error) {
        console.error("Sensor API error:", error)
        return false
      }
    }
    return false
  }

  // Geolocation-based step estimation
  async useGeolocationTracking(): Promise<boolean> {
    if (!navigator.geolocation) return false

    let lastPosition: GeolocationPosition | null = null
    let totalDistance = 0

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (lastPosition) {
          const distance = this.calculateDistance(
            lastPosition.coords.latitude,
            lastPosition.coords.longitude,
            position.coords.latitude,
            position.coords.longitude,
          )

          totalDistance += distance
          // Estimate steps: roughly 1.3 steps per meter
          const estimatedSteps = Math.round(distance * 1.3)
          this.stepCount += estimatedSteps
          this.notifyCallbacks()
        }
        lastPosition = position
      },
      (error) => console.error("Geolocation error:", error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      },
    )

    return true
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  getStepCount(): number {
    return this.stepCount
  }

  resetStepCount(): void {
    this.stepCount = 0
    this.notifyCallbacks()
  }

  setStepCount(count: number): void {
    this.stepCount = count
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

  // Save steps to API
  async saveSteps(userId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch("/api/steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          date: today,
          stepCount: this.stepCount,
          distance: this.stepCount * 0.0008, // Rough estimate
          calories: Math.round(this.stepCount * 0.04),
          activeMinutes: Math.round(this.stepCount * 0.01),
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Failed to save steps:", error)
      return false
    }
  }

  // Load today's steps from API
  async loadTodaySteps(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(`/api/steps?userId=${userId}&date=${today}`)
      const data = await response.json()

      if (data.steps) {
        this.stepCount = data.steps.step_count
        this.notifyCallbacks()
        return this.stepCount
      }
      return 0
    } catch (error) {
      console.error("Failed to load steps:", error)
      return 0
    }
  }
}

// React hook for device motion tracking
export function useDeviceMotion() {
  const [tracker] = useState(() => DeviceMotionTracker.getInstance())

  return {
    startTracking: () => tracker.startTracking(),
    stopTracking: () => tracker.stopTracking(),
    useSensorAPI: () => tracker.useSensorAPI(),
    useGeolocationTracking: () => tracker.useGeolocationTracking(),
    getStepCount: () => tracker.getStepCount(),
    resetStepCount: () => tracker.resetStepCount(),
    setStepCount: (count: number) => tracker.setStepCount(count),
    onStepUpdate: (callback: (steps: number) => void) => tracker.onStepUpdate(callback),
    removeCallback: (callback: (steps: number) => void) => tracker.removeCallback(callback),
    saveSteps: (userId: string) => tracker.saveSteps(userId),
    loadTodaySteps: (userId: string) => tracker.loadTodaySteps(userId),
  }
}
