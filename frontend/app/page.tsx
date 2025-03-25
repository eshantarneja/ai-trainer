import Link from "next/link"
import { workoutRoutines } from "@/lib/workout-data"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white py-6 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">CoreAI</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-md">
        <h2 className="text-xl font-semibold mb-6">Choose a Workout Routine</h2>

        <div className="space-y-4">
          {workoutRoutines.map((routine) => (
            <Link key={routine.id} href={`/${routine.id}`} className="block">
              <div className="bg-white rounded-xl shadow-sm hover:shadow transition-shadow p-5">
                <h3 className="text-xl font-bold mb-2">{routine.name}</h3>
                <p className="text-gray-600 mb-3">{routine.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-4">{routine.exercises.length} exercises</span>
                  <span>{routine.duration} minutes</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

