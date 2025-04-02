'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getRoutine, getExercisesByRoutine, formatRestTime, generateRoutineIntro, generateAnnouncement } from '@/lib/api'
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
  // Flag to track if we need to use browser TTS as fallback
  // No longer using browser TTS as per requirement
  
  // We've removed browser TTS functionality as requested
  
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
        <div className="w-full mb-6">
          {audioUrl ? (
            // Use the ElevenLabs audio player when available
            <div>
              <AudioPlayer
                audioUrl={audioUrl}
                autoPlay={true} // Keep autoplay enabled as requested
                onError={() => {
                  // Don't fall back to browser TTS as requested
                  console.log('Audio error detected but keeping ElevenLabs audio');
                  // We'll just retry instead
                  console.log('Retrying with ElevenLabs audio only');
                }}
              />
            </div>
          ) : (
            // No audio URL, show notification with loading state
            <div className="bg-white rounded-lg p-3 shadow-sm mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-t-slate-800 border-r-slate-800 border-b-slate-800 border-l-transparent animate-spin"></div>
                  <div>
                    <p className="text-sm font-medium">Trainer Introduction</p>
                    <p className="text-xs text-gray-500">Loading audio...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
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
  onExit,
  announcementAudioUrl
}: {
  seconds: number,
  nextExerciseName: string,
  nextExerciseSet: number,
  onComplete: () => void,
  onBack: () => void,
  onExit: () => void,
  announcementAudioUrl: string | null
}) {
  // Play rest announcement when component mounts
  useEffect(() => {
    if (announcementAudioUrl) {
      const audio = new Audio(announcementAudioUrl);
      audio.play().catch(() => {
        console.warn('Could not auto-play audio, browser may restrict autoplay');
        // Try to play on user interaction
        const playOnInteraction = () => {
          audio.play().catch(() => {});
          document.removeEventListener('click', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction, { once: true });
      });
    }
  }, [announcementAudioUrl]);
  
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
          <CountdownTimer seconds={seconds || 60} onComplete={onComplete} />
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
  onExitWorkout,
  announcementAudioUrl
}: { 
  exercise: Exercise & { image: string }, 
  currentSet: number, 
  totalSets: number, 
  onNextSet: () => void, 
  onBack: () => void, 
  onExitWorkout: () => void,
  announcementAudioUrl: string | null
}) {
  // Play rest announcement when component mounts
  useEffect(() => {
    if (announcementAudioUrl) {
      const audio = new Audio(announcementAudioUrl);
      audio.play().catch(() => {
        console.warn('Could not auto-play audio, browser may restrict autoplay');
        // Try to play on user interaction
        const playOnInteraction = () => {
          audio.play().catch(() => {});
          document.removeEventListener('click', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction, { once: true });
      });
    }
  }, [announcementAudioUrl]);
  
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
                  {exercise.reps} reps × {formatRestTime(exercise.rep_time || 10)} per rep
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
  // Flag to track if we should use browser TTS instead of ElevenLabs
  const [useLocalTTS, setUseLocalTTS] = useState(false)
  // Track the next exercise/set to show during rest or after warmup
  const [nextExerciseInfo, setNextExerciseInfo] = useState<{ name: string, set: number }>({ name: '', set: 0 })
  
  // Store announcement audio URLs
  const [announcementAudios, setAnnouncementAudios] = useState<Record<string, string>>({})
  
  // State to track announcements that need fallback TTS
  const [fallbackAnnouncements, setFallbackAnnouncements] = useState<Record<string, string>>({});
  
  // State for warmup intro fallback text
  const [introFallbackText, setIntroFallbackText] = useState<string | null>(null);

  // Function to speak text using browser's built-in TTS with consistent voice
  const speakWithBrowserTTS = (text: string) => {
    console.log('Speaking with browser TTS:', text);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech first
        window.speechSynthesis.cancel();
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;  // Slightly slower rate for better clarity
        utterance.volume = 1.0; // Full volume
        
        // Try to get voices (this may be async on some browsers)
        let voices = window.speechSynthesis.getVoices();
        
        // If voices aren't loaded yet, set up a handler for when they are
        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            // Try to find an English voice if available
            const englishVoices = voices.filter(voice => 
              voice.lang.startsWith('en-') && !voice.name.includes('Google'));
            if (englishVoices.length > 0) {
              utterance.voice = englishVoices[0];
            }
            
            // Now actually speak
            window.speechSynthesis.speak(utterance);
          };
        } else {
          // Voices are already available, use them
          // Try to find an English voice if available
          const englishVoices = voices.filter(voice => 
            voice.lang.startsWith('en-') && !voice.name.includes('Google'));
          if (englishVoices.length > 0) {
            utterance.voice = englishVoices[0];
          }
          
          // Now actually speak
          window.speechSynthesis.cancel(); // Cancel any ongoing speech
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.warn('Error using browser TTS:', err);
      }
    } else {
      console.warn('Browser TTS not supported');
    }
  };

  // Initialize speech synthesis voices - ensures voices are loaded
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Force load voices if they're not already available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // This is a hack to ensure voices are loaded in some browsers
        window.speechSynthesis.onvoiceschanged = () => {
          console.log('Speech synthesis voices loaded');
        };
      }
    }
  }, []);

  // We're no longer using this effect as we're not falling back to browser TTS
  // for the intro audio as requested
  
  // Generate all announcements when routine data is loaded
  useEffect(() => {
    async function generateAllAnnouncements() {
      if (!exercises.length) return;
      
      // 1. Generate browser TTS announcements for exercise and rest transitions
      const fallbacks: Record<string, string> = {};
      const announcementsToGenerate: { key: string; text: string }[] = [];
      
      console.log('Setting up announcements for workout');
      
      // Create list of all announcements we'll need for browser TTS
      exercises.forEach((exercise, exerciseIndex) => {
        for (let setNum = 1; setNum <= exercise.sets; setNum++) {
          // Exercise announcement
          const exerciseText = `Now starting ${exercise.name}, Set ${setNum}`;
          announcementsToGenerate.push({
            key: `exercise_${exercise.id}_set_${setNum}`,
            text: exerciseText
          });
          
          // Rest announcement (except after last set of last exercise)
          if (!(exerciseIndex === exercises.length - 1 && setNum === exercise.sets)) {
            const restSeconds = exercise.rest_time || 60; // Default to 60 if undefined
            const restText = `Now starting Rest. ${restSeconds} seconds.`;
            announcementsToGenerate.push({
              key: `rest_${exercise.id}_set_${setNum}`,
              text: restText
            });
          }
        }
      });
      
      // Set up browser TTS for exercise and rest announcements
      try {
        const allFallbacks: Record<string, string> = {};
        announcementsToGenerate.forEach(item => {
          allFallbacks[item.key] = item.text;
        });
        
        setFallbackAnnouncements(allFallbacks);
        console.log('Browser TTS ready for exercise and rest announcements');
        
      } catch (error) {
        console.warn('Error setting up TTS announcements');
      }
      
      // 2. Generate the warmup intro with ElevenLabs - more personal trainer like
      try {
        const firstExercise = exercises[0];
        // Create an engaging introduction based on the routine name
        let routineType = '';
        if (routine?.name?.toLowerCase().includes('leg')) {
          routineType = 'leg';
        } else if (routine?.name?.toLowerCase().includes('arm') || routine?.name?.toLowerCase().includes('upper')) {
          routineType = 'upper body';
        } else if (routine?.name?.toLowerCase().includes('core') || routine?.name?.toLowerCase().includes('ab')) {
          routineType = 'core';
        } else if (routine?.name?.toLowerCase().includes('cardio')) {
          routineType = 'cardio';
        } else if (routine?.name?.toLowerCase().includes('full')) {
          routineType = 'full body';
        }
        
        const introText = `Hi, I'm your AI Trainer. Welcome to your ${routine?.name || 'workout'} session. ` +
                         `Let's start with a proper 60-second warmup to prepare your body and mind. ` +
                         (routineType ? `This ${routineType} workout will energize you and build strength where you need it most. ` : '') +
                         `We'll begin with ${firstExercise.name} for ${firstExercise.sets} sets, ` +
                         `and I'll guide you through all ${exercises.length} exercises with proper form cues and rest periods. ` +
                         `Remember to stay hydrated and listen to your body throughout this workout. ` +
                         `Let's get started and make today count!`;
        
        // Generate audio with ElevenLabs only - no fallbacks
        console.log('Generating intro audio with ElevenLabs');
        try {
          const result = await generateAnnouncement(introText);
          
          if (result.audioUrl) {
            console.log('Successfully generated ElevenLabs audio');
            setIntroAudioUrl(result.audioUrl);
          } else {
            console.warn('No audio URL returned from ElevenLabs');
          }
        } catch (audioError) {
          console.warn('Error generating audio with ElevenLabs:', audioError);
        }
      } catch (error) {
        console.warn('Error generating intro audio:', error);
      }
    }
    
    if (exercises.length > 0 && !loading) {
      generateAllAnnouncements();
    }
  }, [exercises, loading]);

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
          // Use relative URL for Next.js API rewrites to handle
          const fullAudioUrl = `${routineData.warmup_audio_url}`
          setIntroAudioUrl(fullAudioUrl)
        } else {
          // Try to generate the intro audio if it doesn't exist
          try {
            const response = await generateRoutineIntro(routineId)
            if (response.audio_url) {
              const fullAudioUrl = `${response.audio_url}`
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
  // Helper functions to get the right audio URLs or use browser TTS fallback for exercises and rest periods
  const getExerciseAnnouncementUrl = (exerciseId: string, setNumber: number): string | null => {
    const key = `exercise_${exerciseId}_set_${setNumber}`;
    
    // Check if we should use browser TTS instead
    if (fallbackAnnouncements[key]) {
      console.log('Using browser TTS for exercise announcement:', key);
      // Use a timeout to ensure it runs after component renders
      setTimeout(() => speakWithBrowserTTS(fallbackAnnouncements[key]), 100);
      return null;
    }
    
    return announcementAudios[key] || null;
  };

  const getRestAnnouncementUrl = (exerciseId: string, setNumber: number): string | null => {
    const key = `rest_${exerciseId}_set_${setNumber}`;
    
    // Check if we should use browser TTS instead
    if (fallbackAnnouncements[key]) {
      console.log('Using browser TTS for rest announcement:', key);
      // Use a timeout to ensure it runs after component renders
      setTimeout(() => speakWithBrowserTTS(fallbackAnnouncements[key]), 100);
      return null;
    }
    
    return announcementAudios[key] || null;
  };

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
        seconds={currentExercise.rest_time || 60} // Default to 60 seconds if undefined
        nextExerciseName={nextExerciseInfo.name}
        nextExerciseSet={nextExerciseInfo.set}
        onComplete={() => setIsResting(false)}
        onBack={handleBack}
        onExit={handleExitWorkout}
        announcementAudioUrl={getRestAnnouncementUrl(currentExercise.id, currentSet)}
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
      announcementAudioUrl={getExerciseAnnouncementUrl(currentExercise.id, currentSet)}
    />
  )
}
