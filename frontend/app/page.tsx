'use client'

import Link from "next/link"
import { getRoutines, getExercisesByRoutine } from "@/lib/api"
import { testApiConnection } from "@/lib/debug"
import { useEffect, useState } from "react"

export default function Home() {
  const [routines, setRoutines] = useState<Array<{
    id: string;
    name: string;
    description: string;
    exerciseCount: number;
    duration: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutines() {
      try {
        setLoading(true);
        const routinesData = await getRoutines();
        
        // For each routine, fetch its exercises to get the count
        const routinesWithExercises = await Promise.all(
          routinesData.map(async (routine) => {
            const exercises = await getExercisesByRoutine(routine.id);
            
            // Calculate approximate duration (in minutes)
            const totalSets = exercises.reduce((total, ex) => total + ex.sets, 0);
            const totalRestTime = exercises.reduce((total, ex) => total + (ex.rest_time * (ex.sets - 1)), 0);
            const duration = Math.ceil((totalSets + (totalRestTime / 60)) / 5) * 5; // Round up to nearest 5 minutes
            
            return {
              ...routine,
              exerciseCount: exercises.length,
              duration: duration || 45 // Default to 45 minutes if calculation fails
            };
          })
        );
        
        setRoutines(routinesWithExercises);
      } catch (error) {
        console.error("Error fetching routines:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRoutines();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white py-6 border-b">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">CoreAI</h1>
          <button 
            onClick={() => testApiConnection()} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Test API
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-md">
        <h2 className="text-xl font-semibold mb-6">Choose a Workout Routine</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="flex items-center">
                  <div className="h-3 bg-gray-200 rounded w-1/4 mr-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {routines.map((routine) => (
              <Link key={routine.id} href={`/${routine.id}`} className="block">
                <div className="bg-white rounded-xl shadow-sm hover:shadow transition-shadow p-5">
                  <h3 className="text-xl font-bold mb-2">{routine.name}</h3>
                  <p className="text-gray-600 mb-3">{routine.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">{routine.exerciseCount} exercises</span>
                    <span>{routine.duration} minutes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

