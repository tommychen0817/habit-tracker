"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Habit } from "@/lib/api"

interface CalendarViewProps {
  habits: Habit[]
  onHabitClick: (habitId: number, date: string) => void
}

export function CalendarView({ habits, onHabitClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-sm font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-start-${index}`} className="h-20 p-1 border rounded-md bg-muted/20" />
          ))}

          {monthDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const dayHabits = habits.filter((habit) =>
              habit.completions.some((completion) => completion.date === dateStr),
            )

            return (
              <div
                key={day.toString()}
                className={cn(
                  "h-20 p-1 border rounded-md hover:bg-accent/50 transition-colors",
                  isSameDay(day, new Date()) && "border-primary",
                )}
              >
                <div className="flex flex-col h-full">
                  <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
                  <div className="flex flex-wrap gap-1 overflow-y-auto">
                    <TooltipProvider>
                      {dayHabits.map((habit) => (
                        <Tooltip key={habit.id}>
                          <TooltipTrigger asChild>
                            <Badge
                              className={cn("cursor-pointer", habit.color)}
                              onClick={() => onHabitClick(habit.id, dateStr)}
                            >
                              {habit.name.substring(0, 1)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{habit.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            )
          })}

          {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
            <div key={`empty-end-${index}`} className="h-20 p-1 border rounded-md bg-muted/20" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
