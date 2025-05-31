import { HabitTracker } from "@/components/habit-tracker"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <HabitTracker />
      </div>
    </main>
  )
}
