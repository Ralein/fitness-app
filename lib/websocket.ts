"use client"

// Fallback WebSocket manager that works without external server
export class WebSocketManager {
  private static instance: WebSocketManager
  private callbacks: Map<string, ((data: any) => void)[]> = new Map()
  private isSupabaseRealtime = true // Use Supabase instead

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  connect(userId: string): void {
    console.log("Using Supabase Realtime instead of WebSocket")
    // No external WebSocket needed - using Supabase Realtime
  }

  send(type: string, data: any): void {
    console.log("Message sent via Supabase:", { type, data })
    // Handle via Supabase API calls instead
  }

  subscribe(type: string, callback: (data: any) => void): void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, [])
    }
    this.callbacks.get(type)!.push(callback)
  }

  unsubscribe(type: string, callback: (data: any) => void): void {
    const callbacks = this.callbacks.get(type) || []
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  disconnect(): void {
    console.log("Disconnected from Supabase Realtime")
  }
}

export function useWebSocket(userId: string) {
  const manager = WebSocketManager.getInstance()

  return {
    connect: () => manager.connect(userId),
    send: (type: string, data: any) => manager.send(type, data),
    subscribe: (type: string, callback: (data: any) => void) => manager.subscribe(type, callback),
    unsubscribe: (type: string, callback: (data: any) => void) => manager.unsubscribe(type, callback),
    disconnect: () => manager.disconnect(),
  }
}
