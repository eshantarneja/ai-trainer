#!/usr/bin/env python3
"""
Migration script to convert from the old schema to the new normalized schema:
- Old: routines and exercises (with routine_id)
- New: routines, exercise catalog, and routine_exercises (join table)
"""

import os
import sys
from dotenv import load_dotenv
from firebase_handler import FirebaseHandler
from datetime import datetime
import time

# Load environment variables
load_dotenv()

def migrate_to_new_schema():
    """Migrate data from old schema to new normalized schema."""
    firebase = FirebaseHandler()
    
    # Step 1: Get all existing routines
    print("Fetching all routines...")
    routines = firebase.get_routines()
    
    if not routines:
        print("No routines found. Exiting.")
        return
    
    print(f"Found {len(routines)} routines.")
    
    # Step 2: Create exercise catalog
    print("Creating exercise catalog...")
    exercise_catalog = {}  # name -> id mapping
    
    # Loop through all routines
    for routine in routines:
        routine_id = routine['id']
        print(f"\nProcessing routine: {routine['name']} (ID: {routine_id})")
        
        # Get all exercises for this routine
        exercises = firebase.get_exercises(routine_id)
        print(f"Found {len(exercises)} exercises in routine.")
        
        if not exercises:
            print("No exercises found for this routine. Skipping.")
            continue
        
        # Process each exercise
        for i, exercise in enumerate(exercises):
            # Add to exercise catalog if not already present
            if exercise['name'] not in exercise_catalog:
                # Create new catalog entry
                catalog_data = {
                    'name': exercise['name'],
                    'default_sets': exercise.get('sets', 0),
                    'default_reps': exercise.get('reps', 0),
                    'default_rep_time': exercise.get('rep_time', 3),
                    'default_rest_time': exercise.get('rest_time', 60),
                }
                
                # Create the exercise in the catalog
                exercise_id = firebase.create_exercise(catalog_data)
                exercise_catalog[exercise['name']] = exercise_id
                print(f"Created catalog exercise: {exercise['name']} (ID: {exercise_id})")
            else:
                exercise_id = exercise_catalog[exercise['name']]
                print(f"Using existing catalog exercise: {exercise['name']} (ID: {exercise_id})")
            
            # Create routine_exercise link
            routine_exercise_data = {
                'routine_id': routine_id,
                'exercise_id': exercise_id,
                'order': exercise.get('order', i + 1),  # Use existing order or position in list
                'sets': exercise.get('sets', 0),
                'reps': exercise.get('reps', 0),
                'rep_time': exercise.get('rep_time', 3),
                'rest_time': exercise.get('rest_time', 60),
            }
            
            routine_exercise_id = firebase.create_routine_exercise(routine_exercise_data)
            print(f"Created routine-exercise link (ID: {routine_exercise_id})")
            
            # Wait briefly to avoid overwhelming Firestore
            time.sleep(0.1)
    
    print("\nMigration completed successfully!")

def cleanup_old_data():
    """Remove old exercises (DANGEROUS - only run after verifying migration)."""
    confirm = input("\nAre you sure you want to delete all old exercise data? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Cleanup cancelled.")
        return
    
    firebase = FirebaseHandler()
    
    # Get all exercises
    exercise_docs = firebase.db.collection('exercises').stream()
    count = 0
    
    for doc in exercise_docs:
        exercise_data = doc.to_dict()
        # Only delete exercises that have routine_id (old schema)
        if 'routine_id' in exercise_data:
            doc.reference.delete()
            count += 1
            # Wait briefly to avoid overwhelming Firestore
            time.sleep(0.1)
    
    print(f"Deleted {count} old exercise documents.")

if __name__ == "__main__":
    print("Starting schema migration...")
    migrate_to_new_schema()
    
    # Ask if user wants to clean up old data
    cleanup = input("\nDo you want to clean up old exercise data? (yes/no): ")
    if cleanup.lower() == 'yes':
        cleanup_old_data()
    
    print("Migration process completed.")
