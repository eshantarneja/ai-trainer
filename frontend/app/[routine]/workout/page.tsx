'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getRoutine, getExercisesByRoutine, formatRestTime } from '@/lib/api'
import type { Exercise, Routine } from '@/lib/api'

// A component for the rest timer screen
function RestTimer({ 
  seconds, 
  nextExercise, 
  nextSet, 
  onSkipRest, 
  onBack, 
  onExitWorkout,
  isWarmup = false // New prop to determine if this is a warmup screen
}: { 
  seconds: number, 
  nextExercise: string, 
  nextSet: number, 
  onSkipRest: () => void, 
  onBack: () => void, 
  onExitWorkout: () => void,
  isWarmup?: boolean
}) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  // Reset timer when seconds change (new exercise or set)
  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Automatically proceed to next exercise/set when rest time is up
      onSkipRest()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onSkipRest])

  // Format time display
  const minutes = Math.floor(timeLeft / 60)
  const remainingSeconds = timeLeft % 60
  const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white py-4 px-4 border-b">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="#" className="text-black" onClick={(e) => { e.preventDefault(); onBack(); }}>
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
          <h1 className="text-xl font-semibold">{isWarmup ? 'Warm Up' : 'Rest'}</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 130px)' }}>
        <div className="bg-white p-8 rounded-lg shadow-sm w-full mb-6">
          <h2 className="text-2xl font-bold text-center mb-5">{isWarmup ? 'Warm Up' : 'Rest'}</h2>
          <div className="text-6xl font-bold text-center mb-5">{formattedTime}</div>
          <p className="text-center text-gray-600">
            {isWarmup ? 'Starting With:' : 'Next:'} {nextExercise} - Set {nextSet}
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onBack}
              className="py-3 px-4 bg-gray-200 hover:bg-gray-300 text-slate-800 font-medium rounded-lg text-center"
            >
              Back
            </button>
            <button
              onClick={onSkipRest}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-center"
            >
              {isWarmup ? 'Skip Warm Up' : 'Skip Rest'}
            </button>
          </div>
          <button
            onClick={onExitWorkout}
            className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-slate-800 border border-gray-300 font-medium rounded-lg text-center"
          >
            Exit Workout
          </button>
        </div>
      </main>
    </div>
  )
}

// A component for the exercise screen
function ExerciseView({ 
  exercise, 
  currentSet, 
  totalSets, 
  onNextSet, 
  onBack, 
  onExitWorkout 
}: { 
  exercise: Exercise & { image: string },
  currentSet: number,
  totalSets: number,
  onNextSet: () => void,
  onBack: () => void,
  onExitWorkout: () => void
}) {
  // Default rep time to 3 seconds if not specified in the exercise data
  const defaultRepTime = 3;
  const [repTimeLeft, setRepTimeLeft] = useState(exercise.rep_time || defaultRepTime);

  // Reset rep time when exercise changes
  useEffect(() => {
    setRepTimeLeft(exercise.rep_time || defaultRepTime);
  }, [exercise, defaultRepTime]);

  // Countdown effect for rep time
  useEffect(() => {
    if (repTimeLeft <= 0) {
      // Automatically proceed to rest when rep time is up
      onNextSet();
      return;
    }

    const timer = setInterval(() => {
      setRepTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [repTimeLeft, onNextSet]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white py-4 px-4 border-b">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="#" className="text-black" onClick={(e) => { e.preventDefault(); onBack(); }}>
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
          <h1 className="text-xl font-semibold">{exercise.name}</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-5">
          <h2 className="text-xl font-bold mb-5 text-center">{exercise.name}</h2>
          
          <div className="mb-5">
            <Image
              src={exercise.image}
              alt={exercise.name}
              width={500}
              height={300}
              className="rounded-lg w-full"
            />
          </div>

          <div className="bg-gray-100 py-4 px-4 rounded-lg mb-4">
            <h3 className="text-sm font-medium text-gray-500 text-center mb-1">CURRENT SET</h3>
            <p className="text-4xl font-bold text-center">{currentSet} of {totalSets}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 py-4 px-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 text-center mb-1">REPS</h3>
              <p className="text-4xl font-bold text-center">{exercise.reps}</p>
            </div>
            <div className="bg-gray-100 py-4 px-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 text-center mb-1">REP TIME</h3>
              <p className="text-4xl font-bold text-center">
                {repTimeLeft} sec
              </p>
            </div>
          </div>

          {exercise.name === 'Flat Bench Press' && (
            <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg mt-4">
              <p className="text-blue-800">
                Keep your feet flat on the floor and maintain a slight
                arch in your lower back
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onBack}
              className="py-3 px-4 bg-gray-200 hover:bg-gray-300 text-slate-800 font-medium rounded-lg text-center"
            >
              Back
            </button>
            <button
              onClick={onNextSet}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-center"
            >
              Next
            </button>
          </div>
          <button
            onClick={onExitWorkout}
            className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-slate-800 border border-gray-300 font-medium rounded-lg text-center"
          >
            Exit Workout
          </button>
        </div>
      </main>
    </div>
  )
}

export default function WorkoutPage() {
  const router = useRouter()
  // Use the useParams hook from next/navigation as per Next.js 15 requirements
  const params = useParams()
  const routineId = params.routine as string
  
  const [loading, setLoading] = useState(true)
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [exercises, setExercises] = useState<(Exercise & { image: string })[]>([])
  
  // Workout state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [isResting, setIsResting] = useState(false)
  const [isWarmingUp, setIsWarmingUp] = useState(true) // Start with warmup screen
  // Track the next exercise/set to show during rest or after warmup
  const [nextExerciseInfo, setNextExerciseInfo] = useState<{ name: string, set: number }>({ name: '', set: 0 })
  
  useEffect(() => {
    async function fetchWorkoutData() {
      try {
        setLoading(true)
        
        const routineData = await getRoutine(routineId)
        if (!routineData) {
          router.push('/')
          return
        }
        
        setRoutine(routineData)
        
        const exercisesData = await getExercisesByRoutine(routineId)
        
        // Set first exercise info for warmup screen
        if (exercisesData.length > 0) {
          setNextExerciseInfo({
            name: exercisesData[0].name,
            set: 1
          })
        }
        
        // With the new normalized schema, exercises have an 'order' field that's used to sort them
        // The backend API already returns them sorted, but we'll sort here as well for safety
        const sortedExercises = [...exercisesData].sort((a, b) => {
          // Sort primarily by order field
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order
          } else if (a.order !== undefined) {
            return -1
          } else if (b.order !== undefined) {
            return 1
          }
          
          // Fall back to sorting by name if order is not available
          return a.name.localeCompare(b.name)
        })
        
        const formattedExercises = sortedExercises.map(exercise => ({
          ...exercise,
          // Default rep_time to 3 seconds if not provided in database
          rep_time: exercise.rep_time || 3,
          image: "/placeholder.svg?height=300&width=500",
        }))
        
        setExercises(formattedExercises)
      } catch (error) {
        console.error('Error fetching workout data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchWorkoutData()
  }, [routineId, router])
  
  if (loading || !routine || exercises.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workout...</p>
        </div>
      </div>
    )
  }
  
  const currentExercise = exercises[currentExerciseIndex]
  
  const handleNext = () => {
    // First, determine what's coming next (before updating state)
    let nextExInfo;
    
    // If this was the last set of the current exercise
    if (currentSet >= currentExercise.sets) {
      // If there are more exercises
      if (currentExerciseIndex < exercises.length - 1) {
        // Next will be the first set of the next exercise
        nextExInfo = {
          name: exercises[currentExerciseIndex + 1].name,
          set: 1
        }
        
        // Update the state for next exercise
        setNextExerciseInfo(nextExInfo)
        setCurrentExerciseIndex(prev => prev + 1)
        setCurrentSet(1)
      } else {
        // Workout complete
        router.push('/')
        return
      }
    } else {
      // Next will be the next set of the current exercise
      nextExInfo = {
        name: currentExercise.name,
        set: currentSet + 1
      }
      
      // Save the next info for the rest screen
      setNextExerciseInfo(nextExInfo)
      
      // Move to next set of current exercise
      setCurrentSet(prev => prev + 1)
    }
    
    // Start rest period unless we've completed the workout
    if (!(currentExerciseIndex === exercises.length - 1 && currentSet === currentExercise.sets)) {
      setIsResting(true)
    }
  }
  
  const handleBack = () => {
    if (isResting) {
      // If resting, go back to the exercise screen
      setIsResting(false)
      return
    }
    
    // If on first set of first exercise, go back to routine page
    if (currentExerciseIndex === 0 && currentSet === 1) {
      router.push(`/${routineId}`)
      return
    }
    
    // If on first set of an exercise, go to the last set of previous exercise
    if (currentSet === 1 && currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
      const prevExercise = exercises[currentExerciseIndex - 1]
      setCurrentSet(prevExercise.sets)
    } else {
      // Go to previous set of current exercise
      setCurrentSet(prev => prev - 1)
    }
  }
  
  const handleExitWorkout = () => {
    router.push(`/${routineId}`)
  }
  
  // The next exercise info is now stored in state when the user clicks next
  
  // Handle warmup completion
  const handleWarmupComplete = () => {
    setIsWarmingUp(false)
  }

  // Display different screens based on the workout phase
  if (isWarmingUp) {
    return (
      <RestTimer
        seconds={60} // 1 minute warmup
        nextExercise={nextExerciseInfo.name}
        nextSet={nextExerciseInfo.set}
        onSkipRest={handleWarmupComplete}
        onBack={() => router.push(`/${routineId}`)} // Go back to routine page
        onExitWorkout={handleExitWorkout}
        isWarmup={true} // Pass flag to indicate this is warmup
      />
    )
  }
  
  if (isResting) {
    return (
      <RestTimer
        seconds={currentExercise.rest_time}
        nextExercise={nextExerciseInfo.name}
        nextSet={nextExerciseInfo.set}
        onSkipRest={() => setIsResting(false)}
        onBack={handleBack}
        onExitWorkout={handleExitWorkout}
        isWarmup={false}
      />
    )
  }
  
  return (
    <ExerciseView
      exercise={currentExercise}
      currentSet={currentSet}
      totalSets={currentExercise.sets}
      onNextSet={handleNext}
      onBack={handleBack}
      onExitWorkout={handleExitWorkout}
    />
  )
}
