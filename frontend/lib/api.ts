// API service for communicating with the backend

const API_BASE_URL = 'http://localhost:5002/api';

// Helper function for logging and handling fetch errors
async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  console.log(`Fetching: ${url}`);
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
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
