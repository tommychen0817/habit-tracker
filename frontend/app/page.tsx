"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HabitTracker } from "../components/habit-tracker"

export default function Home() {
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      router.push("/login")
    } else {
      setToken(storedToken)
    }
  }, [router])

  if (!token) return null

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <HabitTracker />
      </div>
    </main>
  )
}