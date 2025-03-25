// API service for workout operations
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Workout {
  id?: string;
  user_id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Exercise {
  name: string;
  sets: Set[];
  notes?: string;
}

export interface Set {
  reps?: number;
  weight?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  completed: boolean;
}

// Get all workouts for a user
export async function getUserWorkouts(userId: string): Promise<Workout[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts?user_id=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.workouts || [];
  } catch (error) {
    console.error('Failed to fetch workouts:', error);
    return [];
  }
}

// Get a specific workout
export async function getWorkout(workoutId: string): Promise<Workout | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.workout || null;
  } catch (error) {
    console.error(`Failed to fetch workout ${workoutId}:`, error);
    return null;
  }
}

// Create a new workout
export async function createWorkout(
  userId: string, 
  workoutData: Omit<Workout, 'user_id' | 'id'>
): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        workout_data: {
          ...workoutData,
          user_id: userId,
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.workout_id || null;
  } catch (error) {
    console.error('Failed to create workout:', error);
    return null;
  }
}

// Update an existing workout
export async function updateWorkout(
  workoutId: string, 
  workoutData: Partial<Workout>
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workout_data: workoutData,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to update workout ${workoutId}:`, error);
    return false;
  }
}

// Delete a workout
export async function deleteWorkout(workoutId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to delete workout ${workoutId}:`, error);
    return false;
  }
}
