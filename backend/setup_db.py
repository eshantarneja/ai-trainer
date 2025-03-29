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
    """Set up initial routines and exercises in Firebase using the new normalized schema."""
    print("Setting up initial routines and exercises with normalized schema...")
    
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
    
    # =========================================================================
    # Step 1: Create Exercise Catalog (reusable exercise definitions)
    # =========================================================================
    print("\nCreating exercise catalog...")
    exercise_catalog = [
        {
            "name": "Flat Bench Press",
            "default_sets": 4,
            "default_reps": 8,
            "default_rep_time": 3,
            "default_rest_time": 90
        },
        {
            "name": "Overhead Press",
            "default_sets": 3,
            "default_reps": 10,
            "default_rep_time": 2,
            "default_rest_time": 60
        },
        {
            "name": "Incline Dumbbell Press",
            "default_sets": 3,
            "default_reps": 12,
            "default_rep_time": 2,
            "default_rest_time": 60
        },
        {
            "name": "Tricep Pushdowns",
            "default_sets": 3,
            "default_reps": 15,
            "default_rep_time": 1,
            "default_rest_time": 45
        },
        {
            "name": "Barbell Rows",
            "default_sets": 4,
            "default_reps": 8,
            "default_rep_time": 2,
            "default_rest_time": 90
        },
        {
            "name": "Pull-ups",
            "default_sets": 3,
            "default_reps": 10,
            "default_rep_time": 2,
            "default_rest_time": 60
        },
        {
            "name": "Face Pulls",
            "default_sets": 3,
            "default_reps": 15,
            "default_rep_time": 1,
            "default_rest_time": 45
        },
        {
            "name": "Barbell Curls",
            "default_sets": 3,
            "default_reps": 12,
            "default_rep_time": 2,
            "default_rest_time": 45
        }
    ]
    
    exercise_ids = {}
    for exercise in exercise_catalog:
        exercise_id = firebase.create_exercise(exercise)
        if exercise_id:
            exercise_ids[exercise["name"]] = exercise_id
            print(f"Created catalog exercise: {exercise['name']} with ID: {exercise_id}")
    
    # =========================================================================
    # Step 2: Create Routine-Exercise Links with specific settings
    # =========================================================================
    print("\nCreating routine-exercise links...")
    
    # Push routine exercises with explicit ordering
    if "Push" in routine_ids and len(exercise_ids) > 0:
        push_routine_exercises = [
            {
                "routine_id": routine_ids["Push"],
                "exercise_id": exercise_ids["Flat Bench Press"],
                "order": 1,  # First exercise in Push routine
                "sets": 4,
                "reps": 8,
                "rest_time": 90,
                "rep_time": 3
            },
            {
                "routine_id": routine_ids["Push"],
                "exercise_id": exercise_ids["Incline Dumbbell Press"],
                "order": 2,  # Second exercise
                "sets": 3,
                "reps": 12,
                "rest_time": 60,
                "rep_time": 2
            },
            {
                "routine_id": routine_ids["Push"],
                "exercise_id": exercise_ids["Tricep Pushdowns"],
                "order": 3,  # Third exercise
                "sets": 3,
                "reps": 15,
                "rest_time": 45,
                "rep_time": 1
            },
            {
                "routine_id": routine_ids["Push"],
                "exercise_id": exercise_ids["Overhead Press"],
                "order": 4,  # Fourth exercise
                "sets": 3,
                "reps": 10,
                "rest_time": 60,
                "rep_time": 2
            }
        ]
        
        for re in push_routine_exercises:
            re_id = firebase.create_routine_exercise(re)
            if re_id:
                # Find the exercise name by matching the ID
                exercise_name = [name for name, id in exercise_ids.items() if id == re['exercise_id']][0]
                print(f"Created routine-exercise link: {re['order']} - {exercise_name} with ID: {re_id}")
    
    # Pull routine exercises with explicit ordering
    if "Pull" in routine_ids and len(exercise_ids) > 0:
        pull_routine_exercises = [
            {
                "routine_id": routine_ids["Pull"],
                "exercise_id": exercise_ids["Barbell Rows"],
                "order": 1,
                "sets": 4,
                "reps": 8,
                "rest_time": 90,
                "rep_time": 2
            },
            {
                "routine_id": routine_ids["Pull"],
                "exercise_id": exercise_ids["Pull-ups"],
                "order": 2,
                "sets": 3,
                "reps": 10,
                "rest_time": 60,
                "rep_time": 2
            },
            {
                "routine_id": routine_ids["Pull"],
                "exercise_id": exercise_ids["Face Pulls"],
                "order": 3,
                "sets": 3,
                "reps": 15,
                "rest_time": 45,
                "rep_time": 1
            },
            {
                "routine_id": routine_ids["Pull"],
                "exercise_id": exercise_ids["Barbell Curls"],
                "order": 4,
                "sets": 3,
                "reps": 12,
                "rest_time": 45,
                "rep_time": 2
            }
        ]
        
        for re in pull_routine_exercises:
            re_id = firebase.create_routine_exercise(re)
            if re_id:
                # Find the exercise name by matching the ID
                exercise_name = [name for name, id in exercise_ids.items() if id == re['exercise_id']][0]
                print(f"Created routine-exercise link: {re['order']} - {exercise_name} with ID: {re_id}")
    
    # Add Legs exercises to catalog if not already added
    legs_exercises_catalog = [
        {
            "name": "Squats",
            "default_sets": 5,
            "default_reps": 5,
            "default_rep_time": 3,
            "default_rest_time": 120
        },
        {
            "name": "Romanian Deadlifts",
            "default_sets": 3,
            "default_reps": 8,
            "default_rep_time": 3,
            "default_rest_time": 90
        },
        {
            "name": "Leg Press",
            "default_sets": 3,
            "default_reps": 12,
            "default_rep_time": 2,
            "default_rest_time": 60
        },
        {
            "name": "Calf Raises",
            "default_sets": 4,
            "default_reps": 15,
            "default_rep_time": 1,
            "default_rest_time": 30
        }
    ]
    
    # Add any legs exercises not already in the catalog
    for exercise in legs_exercises_catalog:
        if exercise["name"] not in exercise_ids:
            exercise_id = firebase.create_exercise(exercise)
            if exercise_id:
                exercise_ids[exercise["name"]] = exercise_id
                print(f"Created catalog exercise: {exercise['name']} with ID: {exercise_id}")
    
    # Legs routine exercises with explicit ordering
    if "Legs" in routine_ids and len(exercise_ids) > 0:
        legs_routine_exercises = [
            {
                "routine_id": routine_ids["Legs"],
                "exercise_id": exercise_ids["Squats"],
                "order": 1,
                "sets": 5,
                "reps": 5,
                "rest_time": 120,
                "rep_time": 3
            },
            {
                "routine_id": routine_ids["Legs"],
                "exercise_id": exercise_ids["Romanian Deadlifts"],
                "order": 2,
                "sets": 3,
                "reps": 8,
                "rest_time": 90,
                "rep_time": 3
            },
            {
                "routine_id": routine_ids["Legs"],
                "exercise_id": exercise_ids["Leg Press"],
                "order": 3,
                "sets": 3,
                "reps": 12,
                "rest_time": 60,
                "rep_time": 2
            },
            {
                "routine_id": routine_ids["Legs"],
                "exercise_id": exercise_ids["Calf Raises"],
                "order": 4,
                "sets": 4,
                "reps": 15,
                "rest_time": 30,
                "rep_time": 1
            }
        ]
        
        for re in legs_routine_exercises:
            re_id = firebase.create_routine_exercise(re)
            if re_id:
                # Find the exercise name by matching the ID
                exercise_name = [name for name, id in exercise_ids.items() if id == re['exercise_id']][0]
                print(f"Created routine-exercise link: {re['order']} - {exercise_name} with ID: {re_id}")
    
    print("Setup complete!")

if __name__ == "__main__":
    setup_routines_and_exercises()
