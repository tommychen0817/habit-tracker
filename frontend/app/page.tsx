"use client"

import { useState, useEffect } from "react"
import { HabitTracker } from "@/components/habit-tracker"
import { GoogleLoginButton } from "@/components/auth/google-login-button"

export default function Home() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem("token"))
  }, [])

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        {token ? (
          <HabitTracker />
        ) : (
          <div className="flex justify-center pt-20">
            <GoogleLoginButton onLogin={() => setToken(localStorage.getItem("token"))} />
          </div>
        )}
      </div>
    </main>
  )
}