"use client"

import { format, subDays } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Habit } from "@/lib/api"

interface StatsCardProps {
  habits: Habit[]
}

export function StatsCard({ habits }: StatsCardProps) {
  const today = format(new Date(), "yyyy-MM-dd")

  // Calculate stats
  const totalHabits = habits.length
  const completedToday = habits.filter((habit) => habit.completions.some((c) => c.date === today)).length

  const todayProgress = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), i), "yyyy-MM-dd"))

  // Calculate streak (consecutive days with at least one habit completed)
  let currentStreak = 0
  for (let i = 0; i < last7Days.length; i++) {
    const date = last7Days[i]
    const hasCompletedHabit = habits.some((habit) => habit.completions.some((c) => c.date === date))

    if (hasCompletedHabit) {
      currentStreak++
    } else if (i === 0) {
      // If today has no completed habits, check if any were completed yesterday
      continue
    } else {
      break
    }
  }

  // Calculate total completions
  const totalCompletions = habits.reduce((sum, habit) => sum + habit.completions.length, 0)

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Today's Progress</CardTitle>
          <CardDescription>
            {completedToday} of {totalHabits} habits completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={todayProgress} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Current Streak</CardTitle>
          <CardDescription>Days with habits completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{currentStreak} days</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Habits</CardTitle>
          <CardDescription>Number of habits you're tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalHabits}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Completions</CardTitle>
          <CardDescription>All time habit completions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalCompletions}</div>
        </CardContent>
      </Card>
    </>
  )
}
