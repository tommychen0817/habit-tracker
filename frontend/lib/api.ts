const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface HabitCompletion {
  id: number
  habit_id: number
  date: string
  description?: string
  created_at: string
}

export interface Habit {
  id: number
  name: string
  description?: string
  color: string
  created_at: string
  completions: HabitCompletion[]
}

export interface CreateHabitData {
  name: string
  description?: string
  color: string
}

export interface CreateCompletionData {
  date: string
  description?: string
}

// Habit API functions
export async function getHabits(): Promise<Habit[]> {
  const response = await fetch(`${API_BASE_URL}/habits`)
  if (!response.ok) throw new Error("Failed to fetch habits")
  return response.json()
}

export async function createHabit(data: CreateHabitData): Promise<Habit> {
  const response = await fetch(`${API_BASE_URL}/habits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create habit")
  return response.json()
}

export async function deleteHabit(habitId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete habit")
}

// Completion API functions
export async function createCompletion(habitId: number, data: CreateCompletionData): Promise<HabitCompletion> {
  const response = await fetch(`${API_BASE_URL}/habits/${habitId}/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create completion")
  return response.json()
}

export async function updateCompletion(
  habitId: number,
  date: string,
  data: { description?: string },
): Promise<HabitCompletion> {
  const response = await fetch(`${API_BASE_URL}/habits/${habitId}/completions/${date}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update completion")
  return response.json()
}

export async function deleteCompletion(habitId: number, date: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/habits/${habitId}/completions/${date}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete completion")
}
