"""
Script to set up initial data in Firebase for routines and exercises.
"""
from firebase_handler import FirebaseHandler
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase
firebase = FirebaseHandler()

def setup_routines_and_exercises():
    """Set up initial routines and exercises in Firebase."""
    print("Setting up initial routines and exercises...")
    
    # Define sample routines
    routines = [
        {
            "name": "Push",
            "description": "Chest, shoulders, and triceps focused workout"
        },
        {
            "name": "Pull",
            "description": "Back and biceps focused workout"
        },
        {
            "name": "Legs",
            "description": "Lower body focused workout"
        }
    ]
    
    routine_ids = {}
    
    # Create routines
    for routine in routines:
        routine_id = firebase.create_routine(routine)
        if routine_id:
            routine_ids[routine["name"]] = routine_id
            print(f"Created routine: {routine['name']} with ID: {routine_id}")
    
    # Define sample exercises for each routine
    if "Push" in routine_ids:
        push_exercises = [
            {
                "routine_id": routine_ids["Push"],
                "name": "Flat Bench Press",
                "sets": 4,
                "reps": 8,
                "rest_time": 90,
                "rep_time": 3
            },
            {
                "routine_id": routine_ids["Push"],
                "name": "Overhead Press",
                "sets": 3,
                "reps": 10,
                "rest_time": 60,
                "rep_time": 2
            },
            {
                "routine_id": routine_ids["Push"],
                "name": "Incline Dumbbell Press",
                "sets": 3,
                "reps": 12,
                "rest_time": 60,
                "rep_time": 2
            },
            {
                "routine_id": routine_ids["Push"],
                "name": "Tricep Pushdowns",
                "sets": 3,
                "reps": 15,
                "rest_time": 45,
                "rep_time": 1
            }
        ]
        
        for exercise in push_exercises:
            exercise_id = firebase.create_exercise(exercise)
            if exercise_id:
                print(f"Created exercise: {exercise['name']} with ID: {exercise_id}")
    
    if "Pull" in routine_ids:
        pull_exercises = [
            {
                "routine_id": routine_ids["Pull"],
                "name": "Barbell Rows",
                "sets": 4,
                "reps": 8,
                "rest_time": 90,
                "rep_time": 2
            },
            {
                "routine_id": routine_ids["Pull"],
                "name": "Pull-ups",
                "sets": 3,
                "reps": 10,
                "rest_time": 60,
                "rep_time": 2
            },
            {
                "routine_id": routine_ids["Pull"],
                "name": "Face Pulls",
                "sets": 3,
                "reps": 15,
                "rest_time": 45,
                "rep_time": 2
            },
            {
                "routine_id": routine_ids["Pull"],
                "name": "Bicep Curls",
                "sets": 3,
                "reps": 12,
                "rest_time": 45,
                "rep_time": 2
            }
        ]
        
        for exercise in pull_exercises:
            exercise_id = firebase.create_exercise(exercise)
            if exercise_id:
                print(f"Created exercise: {exercise['name']} with ID: {exercise_id}")
    
    if "Legs" in routine_ids:
        legs_exercises = [
            {
                "routine_id": routine_ids["Legs"],
                "name": "Squats",
                "sets": 5,
                "reps": 5,
                "rest_time": 120,
                "rep_time": 3
            },
            {
                "routine_id": routine_ids["Legs"],
                "name": "Romanian Deadlifts",
                "sets": 3,
                "reps": 8,
                "rest_time": 90,
                "rep_time": 3
            },
            {
                "routine_id": routine_ids["Legs"],
                "name": "Leg Press",
                "sets": 3,
                "reps": 12,
                "rest_time": 60,
                "rep_time": 2
            },
            {
                "routine_id": routine_ids["Legs"],
                "name": "Calf Raises",
                "sets": 4,
                "reps": 15,
                "rest_time": 30,
                "rep_time": 1
            }
        ]
        
        for exercise in legs_exercises:
            exercise_id = firebase.create_exercise(exercise)
            if exercise_id:
                print(f"Created exercise: {exercise['name']} with ID: {exercise_id}")
    
    print("Setup complete!")

if __name__ == "__main__":
    setup_routines_and_exercises()
