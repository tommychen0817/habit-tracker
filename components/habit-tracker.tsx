"use client"

import { useState, useEffect } from "react"
import { CalendarView } from "./calendar-view"
import { HabitList } from "./habit-list"
import { AddHabitDialog } from "./add-habit-dialog"
import { CompletionDialog } from "./completion-dialog"
import { StatsCard } from "./stats-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import * as api from "@/lib/api"

export function HabitTracker() {
  const [habits, setHabits] = useState<api.Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [addHabitDialogOpen, setAddHabitDialogOpen] = useState(false)
  const [completionDialog, setCompletionDialog] = useState<{
    open: boolean
    habitId?: number
    date?: string
    completion?: api.HabitCompletion
  }>({ open: false })

  const { toast } = useToast()

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    try {
      const data = await api.getHabits()
      setHabits(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load habits",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addHabit = async (habitData: api.CreateHabitData) => {
    try {
      const newHabit = await api.createHabit(habitData)
      setHabits([...habits, newHabit])
      toast({
        title: "Success",
        description: "Habit created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create habit",
        variant: "destructive",
      })
    }
  }

  const deleteHabit = async (habitId: number) => {
    try {
      await api.deleteHabit(habitId)
      setHabits(habits.filter((h) => h.id !== habitId))
      toast({
        title: "Success",
        description: "Habit deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete habit",
        variant: "destructive",
      })
    }
  }

  const handleHabitClick = (habitId: number, date: string) => {
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return

    const completion = habit.completions.find((c) => c.date === date)

    setCompletionDialog({
      open: true,
      habitId,
      date,
      completion,
    })
  }

  const handleCompletionSave = async (data: { description?: string }) => {
    if (!completionDialog.habitId || !completionDialog.date) return

    try {
      if (completionDialog.completion) {
        // Update existing completion
        const updated = await api.updateCompletion(completionDialog.habitId, completionDialog.date, data)
        setHabits(
          habits.map((habit) =>
            habit.id === completionDialog.habitId
              ? {
                  ...habit,
                  completions: habit.completions.map((c) => (c.date === completionDialog.date ? updated : c)),
                }
              : habit,
          ),
        )
      } else {
        // Create new completion
        const newCompletion = await api.createCompletion(completionDialog.habitId, {
          date: completionDialog.date,
          ...data,
        })
        setHabits(
          habits.map((habit) =>
            habit.id === completionDialog.habitId
              ? { ...habit, completions: [...habit.completions, newCompletion] }
              : habit,
          ),
        )
      }

      setCompletionDialog({ open: false })
      toast({
        title: "Success",
        description: "Habit completion saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save completion",
        variant: "destructive",
      })
    }
  }

  const handleCompletionDelete = async () => {
    if (!completionDialog.habitId || !completionDialog.date || !completionDialog.completion) return

    try {
      await api.deleteCompletion(completionDialog.habitId, completionDialog.date)
      setHabits(
        habits.map((habit) =>
          habit.id === completionDialog.habitId
            ? {
                ...habit,
                completions: habit.completions.filter((c) => c.date !== completionDialog.date),
              }
            : habit,
        ),
      )

      setCompletionDialog({ open: false })
      toast({
        title: "Success",
        description: "Habit completion removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove completion",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground">Track your daily habits and build consistency</p>
        </div>
        <Button onClick={() => setAddHabitDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Habit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard habits={habits} />
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-6">
          <CalendarView habits={habits} onHabitClick={handleHabitClick} />
        </TabsContent>
        <TabsContent value="list" className="mt-6">
          <HabitList habits={habits} onHabitClick={handleHabitClick} onDeleteHabit={deleteHabit} />
        </TabsContent>
      </Tabs>

      <AddHabitDialog open={addHabitDialogOpen} onOpenChange={setAddHabitDialogOpen} onAddHabit={addHabit} />

      <CompletionDialog
        open={completionDialog.open}
        onOpenChange={(open) => setCompletionDialog({ open })}
        habitName={habits.find((h) => h.id === completionDialog.habitId)?.name || ""}
        completion={completionDialog.completion}
        onSave={handleCompletionSave}
        onDelete={handleCompletionDelete}
      />
    </div>
  )
}
