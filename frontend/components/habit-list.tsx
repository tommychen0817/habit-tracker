"use client"

import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Habit } from "@/lib/api"

interface HabitListProps {
  habits: Habit[]
  onHabitClick: (habitId: number, date: string) => void
  onDeleteHabit: (habitId: number) => void
}

export function HabitList({ habits, onHabitClick, onDeleteHabit }: HabitListProps) {
  const today = format(new Date(), "yyyy-MM-dd")

  return (
    <div className="space-y-4">
      {habits.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No habits added yet. Click "Add Habit" to get started.
          </CardContent>
        </Card>
      ) : (
        habits.map((habit) => (
          <Card key={habit.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={cn("w-3 h-3", habit.color)} />
                  <CardTitle className="text-lg">{habit.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteHabit(habit.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {habit.description && <CardDescription>{habit.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`habit-${habit.id}`}
                    checked={habit.completions.some((c) => c.date === today)}
                    onCheckedChange={() => onHabitClick(habit.id, today)}
                  />
                  <label
                    htmlFor={`habit-${habit.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Completed today
                  </label>
                </div>
                <div className="text-sm text-muted-foreground">{habit.completions.length} days completed</div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
