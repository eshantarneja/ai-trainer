// API service for communicating with the backend

// Use relative URLs for API requests with Next.js rewrites
const API_BASE_URL = '/api';

// Helper function for logging and handling fetch errors
async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  console.log(`Fetching: ${url}`);
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      // Only log as error if it's not an announcement endpoint (those have fallbacks)
      if (!url.includes('/announcements/')) {
        console.error(`API error (${response.status}): ${errorText}`);
      } else {
        console.warn(`API warning (${response.status}): Using browser TTS fallback`);
      }
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    // Only log as error if it's not an announcement endpoint (those have fallbacks)
    if (!url.includes('/announcements/')) {
      console.error(`Fetch error for ${url}:`, error);
    } else {
      console.warn(`Fetch warning for ${url}: Using browser TTS fallback`);
    }
    throw error;
  }
}

// Text-to-speech response interfaces
export interface TtsVoice {
  voice_id: string;
  name: string;
  category: string;
}

export interface IntroScriptResponse {
  script: string;
}

export interface GenerateIntroResponse {
  message: string;
  audio_url: string;
}

// Base exercise from the catalog
export interface ExerciseCatalogItem {
  id: string;
  name: string;
  default_sets?: number;
  default_reps?: number;
  default_rep_time?: number;
  default_rest_time?: number;
  audio_url?: string;
  created_at: string;
  updated_at: string;
}

// Link between routine and exercise with specific settings
export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  order: number;
  sets: number;
  reps: number;
  rep_time?: number;
  rest_time: number;
  created_at: string;
  updated_at: string;
}

// Combined exercise data for display in a routine
export interface Exercise {
  id: string; // This is the exercise catalog id
  routine_exercise_id: string; // ID of the link record
  name: string;
  sets: number;
  reps: number;
  rest_time: number;
  rep_time?: number;
  order: number;
  audio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  warmup_audio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RoutineWithExercises extends Routine {
  exercises: Exercise[];
  duration: number; // Calculated based on exercises
}

// Fetch all routines
export async function getRoutines(): Promise<Routine[]> {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/routines`);
    const data = await response.json();
    return data.routines;
  } catch (error) {
    console.error('Error fetching routines:', error);
    return [];
  }
}

// Fetch a specific routine by ID
export async function getRoutine(routineId: string): Promise<Routine | null> {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/routines/${routineId}`);
    const data = await response.json();
    return data.routine;
  } catch (error) {
    console.error(`Error fetching routine ${routineId}:`, error);
    return null;
  }
}

// Fetch exercises for a specific routine
export async function getExercisesByRoutine(routineId: string): Promise<Exercise[]> {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/exercises?routine_id=${routineId}`);
    const data = await response.json();
    
    // The backend already returns exercises in the correct order
    return data.exercises;
  } catch (error) {
    console.error(`Error fetching exercises for routine ${routineId}:`, error);
    return [];
  }
}

// Fetch all exercises from the catalog
export async function getExerciseCatalog(): Promise<ExerciseCatalogItem[]> {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/exercises/catalog`);
    const data = await response.json();
    return data.exercises;
  } catch (error) {
    console.error('Error fetching exercise catalog:', error);
    return [];
  }
}

// Get a specific exercise from the catalog
export async function getExerciseCatalogItem(exerciseId: string): Promise<ExerciseCatalogItem | null> {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/exercises/catalog/${exerciseId}`);
    const data = await response.json();
    return data.exercise;
  } catch (error) {
    console.error(`Error fetching exercise catalog item ${exerciseId}:`, error);
    return null;
  }
}

// Get all routine exercises (links) for a routine
export async function getRoutineExercises(routineId: string): Promise<RoutineExercise[]> {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/routine-exercises?routine_id=${routineId}`);
    const data = await response.json();
    return data.routineExercises;
  } catch (error) {
    console.error(`Error fetching routine exercises for routine ${routineId}:`, error);
    return [];
  }
}

// Fetch a routine with its exercises
export async function getRoutineWithExercises(routineId: string): Promise<RoutineWithExercises | null> {
  try {
    const routine = await getRoutine(routineId);
    if (!routine) {
      return null;
    }
    
    const exercises = await getExercisesByRoutine(routineId);
    
    // Calculate approximate workout duration (in minutes)
    // Assuming each set takes about 1 minute plus rest time
    const totalSets = exercises.reduce((total, ex) => total + ex.sets, 0);
    const totalRestTime = exercises.reduce((total, ex) => total + (ex.rest_time * (ex.sets - 1)), 0);
    const duration = Math.ceil((totalSets + (totalRestTime / 60)) / 5) * 5; // Round up to nearest 5 minutes
    
    return {
      ...routine,
      exercises,
      duration: duration || 45 // Default to 45 minutes if calculation fails
    };
  } catch (error) {
    console.error(`Error fetching routine with exercises ${routineId}:`, error);
    return null;
  }
}

// Utility to format rest time from seconds to a readable string
export function formatRestTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sec`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 
      ? `${minutes} min ${remainingSeconds} sec` 
      : `${minutes} min`;
  }
}

// Get intro script for a routine
export async function getRoutineIntroScript(routineId: string): Promise<IntroScriptResponse> {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/routines/${routineId}/intro-script`);
  return await response.json();
}

// Generate audio introduction for a routine
export async function generateRoutineIntro(routineId: string): Promise<GenerateIntroResponse> {
  const response = await fetchWithErrorHandling(
    `${API_BASE_URL}/routines/${routineId}/generate-intro`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }
  );
  return await response.json();
}

// Get available TTS voices
export async function getTtsVoices(): Promise<TtsVoice[]> {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/tts/voices`);
  const data = await response.json();
  return data.voices || [];
}

// Generate TTS from text
export async function generateTtsSpeech(text: string, voiceId?: string): Promise<Blob> {
  const response = await fetchWithErrorHandling(
    `${API_BASE_URL}/tts/generate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_id: voiceId })
    }
  );
  return await response.blob();
}

// Generate workout announcement audio
export async function generateAnnouncement(text: string): Promise<{ audioUrl: string | null; useFallback: boolean }> {
  try {
    // First, get the audio URL from the backend
    const response = await fetchWithErrorHandling(
      `${API_BASE_URL}/announcements/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      }
    );
    
    const data = await response.json();
    const remoteUrl = data.audio_url;
    
    if (!remoteUrl) {
      console.error('No audio URL returned from server');
      return { audioUrl: null, useFallback: false };
    }
    
    console.log('Downloading full audio file from:', remoteUrl);
    
    // Now fetch the actual audio file with multiple retries
    let retries = 0;
    const MAX_RETRIES = 3;
    
    while (retries < MAX_RETRIES) {
      try {
        // Use a fresh timestamp for each retry to avoid caching issues
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000000);
        const urlWithParams = remoteUrl.includes('?') ?
          `${remoteUrl}&t=${timestamp}&r=${random}` :
          `${remoteUrl}?t=${timestamp}&r=${random}`;
          
        console.log(`Download attempt ${retries + 1} for audio file`);
        
        // Fetch with a timeout - increase timeout for each retry
        const controller = new AbortController();
        const timeoutMs = 10000 + (retries * 5000); // 10s, 15s, 20s
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        // Fetch the audio data
        const audioResponse = await fetch(urlWithParams, {
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!audioResponse.ok) {
          throw new Error(`Failed to download audio: ${audioResponse.status}`);
        }
        
        // Check content type to ensure we got audio
        const contentType = audioResponse.headers.get('content-type');
        if (contentType && !contentType.includes('audio/') && !contentType.includes('application/octet-stream')) {
          console.warn(`Unexpected content type: ${contentType}`);
        }
        
        // Download the entire file first
        const audioBlob = await audioResponse.blob();
        
        // Validate blob size - ensure we got the full file
        if (audioBlob.size < 1000) { // Files should be at least 1KB
          console.warn(`Audio file seems too small: ${audioBlob.size} bytes. Retrying...`);
          retries++;
          continue;
        }
        
        // Validate that it's actually audio data by checking the first few bytes
        // This is a simple check and not foolproof
        const arrayBuffer = await audioBlob.arrayBuffer();
        const firstBytes = new Uint8Array(arrayBuffer.slice(0, 4));
        
        // Create a local URL for the blob
        const localBlobUrl = URL.createObjectURL(audioBlob);
        
        console.log('Successfully created local blob URL for complete audio');
        return { audioUrl: localBlobUrl, useFallback: false };
      } catch (audioError) {
        console.error(`Error downloading audio file (attempt ${retries + 1}):`, audioError);
        retries++;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // All retries failed, but still return the remote URL
    // We won't fall back to browser TTS as specifically requested by the user
    console.warn('All download attempts failed, using direct remote URL');
    return { audioUrl: remoteUrl, useFallback: false };
  } catch (error) {
    console.error('Error generating announcement:', error);
    // We're explicitly NOT enabling fallback as requested by user
    return { audioUrl: null, useFallback: false };
  }
}
