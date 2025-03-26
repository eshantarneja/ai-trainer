'use client'

import Link from "next/link"
import Image from "next/image"
import { notFound, useParams } from "next/navigation"
import { getRoutine, getExercisesByRoutine, formatRestTime } from "@/lib/api"
import { useEffect, useState } from "react"
import type { Exercise, Routine } from "@/lib/api"

export default function RoutinePage() {
  // Use the useParams hook instead of accessing params directly
  const params = useParams()
  const routineId = Array.isArray(params.routine) ? params.routine[0] : params.routine as string
  
  const [routineData, setRoutineData] = useState<Routine | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutineData() {
      try {
        setLoading(true);
        const routineResponse = await getRoutine(routineId);
        
        if (!routineResponse) {
          notFound();
          return;
        }
        
        setRoutineData(routineResponse);
        
        const exercisesData = await getExercisesByRoutine(routineId);
        setExercises(exercisesData);
      } catch (error) {
        console.error("Error fetching routine data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRoutineData();
  }, [routineId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white py-4 px-4 border-b">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <Link href="/" className="text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-left"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="w-12"></div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-4">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm p-4">
                  <div className="flex">
                    <div className="mr-4 w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }
  
  if (!routineData) {
    notFound();
  }

  // For now, we'll treat all exercises as straight sets since our API doesn't support supersets yet
  // We're simplifying the UI to just display exercises without superset grouping
  const formattedExercises = exercises.map(exercise => ({
    id: exercise.id,
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    rest: formatRestTime(exercise.rest_time),
    image: "/placeholder.svg?height=80&width=80",
    setType: "straight" as const
  }))

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white py-4 px-4 border-b">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-left"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold">{routineData.name}</h1>
          <div className="flex items-center space-x-4">
            <button className="text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-calendar"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </button>
            <button className="text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-settings"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        <div className="space-y-4">
          {formattedExercises.map((exercise, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-lg font-semibold">Straight set</h3>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 flex">
                  <div className="mr-4">
                    <Image
                      src={exercise.image}
                      alt={exercise.name}
                      width={80}
                      height={80}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium">{exercise.name}</h4>
                    <p className="text-gray-500">
                      {exercise.sets} sets • {exercise.reps} reps • {exercise.rest} rest
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-4">
            <Link 
              href={`/${routineId}/workout`}
              className="w-full block py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-center">
              Start Routine
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

