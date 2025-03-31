'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getRoutine, getExercisesByRoutine, formatRestTime, generateRoutineIntro } from '@/lib/api'
import type { Exercise, Routine } from '@/lib/api'
import AudioPlayer from '@/components/AudioPlayer'

// Simple countdown timer component that only handles the time display
function CountdownTimer({ 
  seconds, 
  onComplete 
}: { 
  seconds: number, 
  onComplete: () => void 
}) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  // Reset timer when seconds change
  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onComplete])

  // Format time display
  const minutes = Math.floor(timeLeft / 60)
  const remainingSeconds = timeLeft % 60
  const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`

  return (
    <div className="text-6xl font-bold text-center mb-5">{formattedTime}</div>
  )
}

// Warmup screen component
function WarmupScreen({
  nextExerciseName,
  nextExerciseSet,
  audioUrl,
  onComplete,
  onExit
}: {
  nextExerciseName: string,
  nextExerciseSet: number,
  audioUrl: string | null,
  onComplete: () => void,
  onExit: () => void
}) {
  // The audio player is only rendered once when this component mounts
  // It won't be affected by the timer updates
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white py-4 px-4 border-b">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="#" className="text-black" onClick={(e) => { e.preventDefault(); onExit(); }}>
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
          <h1 className="text-xl font-semibold">Warm Up</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 130px)' }}>
        {audioUrl && (
          <div className="w-full mb-6">
            <AudioPlayer 
              audioUrl={audioUrl} 
              autoPlay={true} 
              onEnded={() => console.log('Audio introduction complete')} 
              onError={() => console.error('Failed to play introduction audio')} 
            />
          </div>
        )}
        
        <div className="bg-white p-8 rounded-lg shadow-sm w-full mb-6">
          <h2 className="text-2xl font-bold text-center mb-5">Warm Up</h2>
          <CountdownTimer seconds={60} onComplete={onComplete} />
          <p className="text-center text-gray-600 mt-4">
            Starting With: {nextExerciseName} - Set {nextExerciseSet}
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onExit}
              className="w-full py-3 bg-white text-slate-800 rounded-lg shadow-sm border border-slate-200"
            >
              Exit Workout
            </button>
            <button
              onClick={onComplete}
              className="w-full py-3 bg-slate-800 text-white rounded-lg shadow-sm"
            >
              Skip Warmup
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// Rest screen component
function RestScreen({
  seconds,
  nextExerciseName,
  nextExerciseSet,
  onComplete,
  onBack,
  onExit
}: {
  seconds: number,
  nextExerciseName: string,
  nextExerciseSet: number,
  onComplete: () => void,
  onBack: () => void,
  onExit: () => void
}) {
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
          <h1 className="text-xl font-semibold">Rest</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 130px)' }}>
        <div className="bg-white p-8 rounded-lg shadow-sm w-full mb-6">
          <h2 className="text-2xl font-bold text-center mb-5">Rest</h2>
          <CountdownTimer seconds={seconds} onComplete={onComplete} />
          <p className="text-center text-gray-600 mt-4">
            Next: {nextExerciseName} - Set {nextExerciseSet}
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onExit}
              className="w-full py-3 bg-white text-slate-800 rounded-lg shadow-sm border border-slate-200"
            >
              Exit Workout
            </button>
            <button
              onClick={onComplete}
              className="w-full py-3 bg-slate-800 text-white rounded-lg shadow-sm"
            >
              Skip Rest
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// A component for the exercise view
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

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="relative aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
            <Image 
              src={exercise.image || "/placeholder.svg"} 
              alt={exercise.name} 
              fill 
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">{exercise.name}</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {exercise.reps} reps × {formatRestTime(exercise.rep_time)} per rep
                </p>
              </div>
              <div className="bg-slate-100 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium">Set {currentSet} of {totalSets}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-medium mb-2">Form Tips:</h3>
              <p className="text-gray-700">
                Keep your back straight and maintain proper form throughout the movement.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
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
              {currentSet < totalSets ? 'Next Set' : 'Complete'}
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
  const [introAudioUrl, setIntroAudioUrl] = useState<string | null>(null)
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
        
        // Check for existing warmup audio and set it, or try to generate new audio
        if (routineData.warmup_audio_url) {
          // Convert relative URL to absolute URL
          const fullAudioUrl = `http://localhost:5002${routineData.warmup_audio_url}`
          setIntroAudioUrl(fullAudioUrl)
        } else {
          // Try to generate the intro audio if it doesn't exist
          try {
            const response = await generateRoutineIntro(routineId)
            if (response.audio_url) {
              const fullAudioUrl = `http://localhost:5002${response.audio_url}`
              setIntroAudioUrl(fullAudioUrl)
            }
          } catch (audioError) {
            console.error('Could not generate intro audio:', audioError)
            // Continue without audio if generation fails
          }
        }
        
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
  
  // Handle warmup completion
  const handleWarmupComplete = () => {
    setIsWarmingUp(false)
  }

  // Display different screens based on the workout phase
  if (isWarmingUp) {
    return (
      <WarmupScreen
        nextExerciseName={nextExerciseInfo.name}
        nextExerciseSet={nextExerciseInfo.set}
        audioUrl={introAudioUrl}
        onComplete={handleWarmupComplete}
        onExit={handleExitWorkout}
      />
    )
  }
  
  if (isResting) {
    return (
      <RestScreen
        seconds={currentExercise.rest_time}
        nextExerciseName={nextExerciseInfo.name}
        nextExerciseSet={nextExerciseInfo.set}
        onComplete={() => setIsResting(false)}
        onBack={handleBack}
        onExit={handleExitWorkout}
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
