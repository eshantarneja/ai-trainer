'use client'

import { useState, useEffect, useRef } from 'react'

interface AudioPlayerProps {
  audioUrl: string | null
  autoPlay?: boolean
  onEnded?: () => void
  onError?: () => void
}

export default function AudioPlayer({ 
  audioUrl, 
  autoPlay = true, 
  onEnded, 
  onError 
}: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playAttemptRef = useRef<number>(0)

  useEffect(() => {
    if (!audioUrl) return
    
    setIsLoading(true)
    setError(null)
    
    // Check if it's a blob URL (which means the audio is already pre-loaded)
    const isPreloadedBlob = audioUrl.startsWith('blob:');
    
    // Only add timestamps to remote URLs, not to blob URLs
    const finalUrl = isPreloadedBlob ? audioUrl : (
      audioUrl.includes('?') ? 
        `${audioUrl}&t=${new Date().getTime()}` : 
        `${audioUrl}?t=${new Date().getTime()}`
    );
    
    console.log('Loading audio from URL:', isPreloadedBlob ? 'pre-loaded blob URL' : finalUrl)
    
    // Handle the audio element's events
    const handleCanPlayThrough = () => {
      setIsLoading(false)
      if (autoPlay && audioRef.current) {
        audioRef.current.play().catch(err => {
          console.error('Failed to auto-play audio:', err)
          setError('Failed to play audio automatically. Please tap play.')
        })
      }
    }
    
    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e)
      setIsLoading(false)
      setError('Failed to load audio')
      if (onError) onError()
    }
    
    const handleEnded = () => {
      if (onEnded) onEnded()
    }
    
    // Set up the audio element
    const audio = new Audio(finalUrl)
    // Explicitly prevent looping
    audio.loop = false
    // Set preload to auto and prioritize loading the audio
    audio.preload = 'auto'
    // For Firefox-specific optimizations (safely typed with any)
    try {
      // These are Firefox-specific properties that improve audio reliability
      const firefoxAudio = audio as any;
      if (typeof firefoxAudio.mozAudioChannelType !== 'undefined') {
        firefoxAudio.mozAudioChannelType = 'content';
      }
      if (typeof firefoxAudio.mozAutoplayEnabled !== 'undefined') {
        firefoxAudio.mozAutoplayEnabled = true;
      }
    } catch (e) {
      // Ignore errors for browsers that don't support these properties
    }
    audioRef.current = audio
    
    // Track if we already tried to play to avoid infinite retries
    let playAttempted = false
    
    audio.addEventListener('canplaythrough', () => {
      setIsLoading(false)
      console.log('Audio can play through')
      // Only attempt to auto-play once to avoid loop
      if (autoPlay && audioRef.current && !playAttempted) {
        playAttempted = true
        // Check if it's a blob URL (already fully loaded)
        const isBlob = audioUrl.startsWith('blob:');
        // For blob URLs, we can play sooner since the data is already local
        const delayMs = isBlob ? 100 : 500;
        
        setTimeout(() => {
          console.log(`Attempting auto-play ${isBlob ? '(blob URL)' : ''}`)
          audioRef.current?.play().catch((err) => {
            console.warn('Browser blocked auto-play:', err)
            setError('Failed to play audio automatically. Please tap play.')
          })
        }, delayMs)
      }
    })
    
    // Set a timeout for loading but ensure we don't show errors if audio is actually playing
    const timeoutId = setTimeout(() => {
      if (isLoading && audioRef.current) {
        // Check if audio is actually playing or has completed before showing error
        if (audioRef.current.paused && audioRef.current.currentTime === 0) {
          console.warn('Audio loading timeout exceeded')
          setIsLoading(false)
          setError('Audio is taking too long to load. Please try again.')
          if (onError) onError()
        } else {
          // Audio is playing or has played, so don't show an error
          console.log('Audio is playing or has played, clearing loading state')
          setIsLoading(false)
          setError(null)
        }
      }
    }, 15000) // Longer 15 second timeout
    
    audio.addEventListener('error', handleError as EventListener)
    audio.addEventListener('ended', handleEnded)
    
    // Clean up when component unmounts or audioUrl changes
    return () => {
      clearTimeout(timeoutId)
      audio.pause()
      audio.src = ''
      audio.load() // Reset the audio element completely
      audio.removeEventListener('canplaythrough', handleCanPlayThrough)
      audio.removeEventListener('error', handleError as EventListener)
      audio.removeEventListener('ended', handleEnded)
      audioRef.current = null
    }
  }, [audioUrl, autoPlay, onEnded, onError])

  // Function to manually play audio
  const playAudio = () => {
    if (!audioRef.current && audioUrl) {
      // If for some reason the audio element isn't initialized yet,
      // create a new one before attempting to play
      console.log('Audio ref not initialized, creating new Audio element');
      
      // Determine if this is a blob URL (pre-downloaded) or remote URL
      const isPreloadedBlob = audioUrl.startsWith('blob:');
      
      // Only add cache buster for non-blob URLs
      const urlToUse = isPreloadedBlob ? audioUrl : (
        audioUrl.includes('?') ? 
          `${audioUrl}&t=${new Date().getTime()}&r=${Math.random()}` : 
          `${audioUrl}?t=${new Date().getTime()}&r=${Math.random()}`
      );
      
      console.log(`Creating audio element with ${isPreloadedBlob ? 'blob' : 'remote'} URL`);
      
      const audio = new Audio(urlToUse);
      
      // Set critical audio properties for reliable playback
      audio.preload = 'auto';
      
      // For blob URLs that are already downloaded, we can set additional properties
      if (isPreloadedBlob) {
        try {
          // These help with smoother playback of pre-loaded audio
          audio.preservesPitch = false; // Allows for smoother playback
          audio.oncanplaythrough = null; // Clear any existing handlers
        } catch (e) {}
      }
      
      audioRef.current = audio;
      
      // Reset play attempts counter
      playAttemptRef.current = 0;
      
      // For blob URLs, we can play almost immediately since the data is local
      if (isPreloadedBlob) {
        console.log('Using pre-downloaded blob, playing right away');
        // Short timeout to ensure browser is ready
        setTimeout(() => {
          setIsLoading(false);
          manualPlayWithRetry();
        }, 100);
      } else {
        // For remote URLs, wait for canplaythrough event
        audio.addEventListener('canplaythrough', () => {
          console.log('Audio fully loaded and ready to play');
          setIsLoading(false);
          manualPlayWithRetry();
        });
      }
      
      setIsLoading(true);
      return;
    }
    
    // Reset attempts counter for manual play
    playAttemptRef.current = 0;
    manualPlayWithRetry();
  }
  
  // Helper function to attempt playback with retries
  const manualPlayWithRetry = () => {
    if (!audioRef.current) return;
    
    // Make sure we're reset to the beginning if needed
    if (audioRef.current.ended || audioRef.current.currentTime > 0) {
      audioRef.current.currentTime = 0;
    }
    
    // Ensure volume is at maximum
    audioRef.current.volume = 1.0;
    
    // Increment attempt counter
    playAttemptRef.current += 1;
    console.log(`Manual play attempt ${playAttemptRef.current}`);
    
    // Check if it's a blob URL (already fully downloaded data) 
    const isBlob = audioUrl?.startsWith('blob:') || false;
    
    // Add listeners for problematic events before playing
    if (audioRef.current) {
      const handleAudioError = (e: Event) => {
        console.error('Audio playback error:', e);
      };
      
      const handleEnded = () => {
        console.log('Audio playback completed successfully');
      };
      
      const handleStalled = () => {
        console.warn('Audio playback stalled');
      };
      
      // Clean up any existing listeners first
      audioRef.current.removeEventListener('error', handleAudioError);
      audioRef.current.removeEventListener('ended', handleEnded);
      audioRef.current.removeEventListener('stalled', handleStalled);
      
      // Add fresh listeners
      audioRef.current.addEventListener('error', handleAudioError);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('stalled', handleStalled);
    }
    
    // For blob URLs, which are already downloaded, we can play immediately
    if (isBlob) {
      console.log('Playing from a pre-downloaded blob URL - should be very reliable');
    }
    
    // Play with proper error handling
    audioRef.current.play().catch(err => {
      console.error('Failed to play audio:', err);
      
      if (playAttemptRef.current < 3) {
        // Try again after a short delay
        console.log(`Retrying manual play (attempt ${playAttemptRef.current + 1} of 3)`);
        setTimeout(() => manualPlayWithRetry(), 500);
      } else {
        console.error('All manual play attempts failed');
        setError('Failed to play audio after multiple attempts. Please try refreshing the page.');
        
        // If all attempts fail, try one last completely different approach
        if (audioUrl) {
          console.log('Last resort approach with fresh context');
          
          // Determine if we're working with a blob URL or remote URL
          const isBlob = audioUrl.startsWith('blob:');
          
          // For blobs, we actually need to re-fetch them since they're already optimized
          // For remote URLs, we need a strong cache-buster
          const finalUrl = isBlob ? audioUrl : (
            audioUrl.includes('?') ? 
              `${audioUrl}&t=${Date.now()}&r=${Math.random()}` : 
              `${audioUrl}?t=${Date.now()}&r=${Math.random()}`
          );
          
          // Create a brand new audio context
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          const loadAndPlayAudio = async () => {
            try {
              // Fetch the audio data directly 
              const response = await fetch(finalUrl);
              const arrayBuffer = await response.arrayBuffer();
              
              // Decode the audio data
              const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
              
              // Create a new source node
              const source = audioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContext.destination);
              
              // Play the audio
              console.log('Playing via AudioContext API - most reliable method');
              source.start(0);
            } catch (error) {
              console.error('Final AudioContext approach failed:', error);
              if (onError) onError();
            }
          };
          
          loadAndPlayAudio();
        }
      }
    });
  }

  // Function to pause audio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  // Track playback state for UI updates
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Update playing state when audio plays or pauses
  useEffect(() => {
    if (!audioRef.current) return
    
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    
    audioRef.current.addEventListener('play', handlePlay)
    audioRef.current.addEventListener('pause', handlePause)
    audioRef.current.addEventListener('ended', handleEnded)
    
    return () => {
      audioRef.current?.removeEventListener('play', handlePlay)
      audioRef.current?.removeEventListener('pause', handlePause)
      audioRef.current?.removeEventListener('ended', handleEnded)
    }
  }, [audioRef.current])

  if (!audioUrl) {
    return null
  }

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full border-2 border-t-slate-800 border-r-slate-800 border-b-slate-800 border-l-transparent animate-spin"></div>
          ) : error ? (
            <button
              onClick={playAudio}
              className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center"
              aria-label="Try Again"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-refresh-cw"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </button>
          ) : !isPlaying ? (
            <button
              onClick={playAudio}
              className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center"
              aria-label="Play"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-play"
              >
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            </button>
          ) : (
            <button
              onClick={pauseAudio}
              className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center"
              aria-label="Pause"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-pause"
              >
                <rect width="4" height="16" x="6" y="4" />
                <rect width="4" height="16" x="14" y="4" />
              </svg>
            </button>
          )}
          <div>
            <p className="text-sm font-medium">Trainer Audio</p>
            {error ? (
              <p className="text-xs text-red-500">{error}</p>
            ) : isLoading ? (
              <p className="text-xs text-gray-500">Loading audio...</p>
            ) : (
              <p className="text-xs text-gray-500">Trainer introduction</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
