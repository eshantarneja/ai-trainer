import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import uuid
from datetime import datetime

class FirebaseHandler:
    """Handler for Firebase Firestore operations for workout tracking."""
    
    def __init__(self):
        """Initialize Firebase connection."""
        self.app = None
        self.db = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase using credentials."""
        # Check if Firebase is already initialized
        if not firebase_admin._apps:
            # Check if credentials file exists
            cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH')
            
            if cred_path and os.path.exists(cred_path):
                # Initialize with credential file
                cred = credentials.Certificate(cred_path)
                self.app = firebase_admin.initialize_app(cred)
            else:
                # Try to initialize with JSON string from environment variable
                cred_json = os.environ.get('FIREBASE_CREDENTIALS_JSON')
                if cred_json:
                    try:
                        cred_dict = json.loads(cred_json)
                        cred = credentials.Certificate(cred_dict)
                        self.app = firebase_admin.initialize_app(cred)
                    except json.JSONDecodeError:
                        print("Error: Invalid JSON in FIREBASE_CREDENTIALS_JSON")
                        return
                else:
                    print("Warning: No Firebase credentials found. Using local emulator or default app.")
                    self.app = firebase_admin.initialize_app()
        else:
            self.app = firebase_admin.get_app()
            
        self.db = firestore.client()

    def get_workouts(self, user_id):
        """Get all workouts for a specific user."""
        try:
            workouts_ref = self.db.collection('workouts').where('user_id', '==', user_id)
            workouts = []
            
            for doc in workouts_ref.stream():
                workout_data = doc.to_dict()
                workout_data['id'] = doc.id
                workouts.append(workout_data)
                
            return workouts
        except Exception as e:
            print(f"Error getting workouts: {e}")
            return []

    def get_workout(self, workout_id):
        """Get a specific workout by ID."""
        try:
            doc_ref = self.db.collection('workouts').document(workout_id)
            doc = doc_ref.get()
            
            if doc.exists:
                workout_data = doc.to_dict()
                workout_data['id'] = doc.id
                return workout_data
            else:
                return None
        except Exception as e:
            print(f"Error getting workout: {e}")
            return None

    def create_workout(self, user_id, workout_data):
        """Create a new workout document in Firestore."""
        try:
            # Add timestamp and user_id
            workout_data['user_id'] = user_id
            workout_data['created_at'] = datetime.now().isoformat()
            workout_data['updated_at'] = datetime.now().isoformat()
            
            # Add unique ID if not provided
            workout_id = workout_data.get('id', str(uuid.uuid4()))
            
            # Set the document with the specified ID
            doc_ref = self.db.collection('workouts').document(workout_id)
            doc_ref.set(workout_data)
            
            return workout_id
        except Exception as e:
            print(f"Error creating workout: {e}")
            return None

    def update_workout(self, workout_id, workout_data):
        """Update a specific workout document."""
        try:
            # Add updated timestamp
            workout_data['updated_at'] = datetime.now().isoformat()
            
            doc_ref = self.db.collection('workouts').document(workout_id)
            doc_ref.update(workout_data)
            
            return True
        except Exception as e:
            print(f"Error updating workout: {e}")
            return False

    def delete_workout(self, workout_id):
        """Delete a specific workout document."""
        try:
            doc_ref = self.db.collection('workouts').document(workout_id)
            doc_ref.delete()
            
            return True
        except Exception as e:
            print(f"Error deleting workout: {e}")
            return False
            
    # Routines Collection Methods
    
    def get_routines(self):
        """Get all workout routines."""
        try:
            routines_ref = self.db.collection('routines')
            routines = []
            
            for doc in routines_ref.stream():
                routine_data = doc.to_dict()
                routine_data['id'] = doc.id
                routines.append(routine_data)
                
            return routines
        except Exception as e:
            print(f"Error getting routines: {e}")
            return []

    def get_routine(self, routine_id):
        """Get a specific routine by ID."""
        try:
            doc_ref = self.db.collection('routines').document(routine_id)
            doc = doc_ref.get()
            
            if doc.exists:
                routine_data = doc.to_dict()
                routine_data['id'] = doc.id
                return routine_data
            else:
                return None
        except Exception as e:
            print(f"Error getting routine: {e}")
            return None

    def create_routine(self, routine_data):
        """Create a new routine document in Firestore."""
        try:
            # Add timestamp
            routine_data['created_at'] = datetime.now().isoformat()
            routine_data['updated_at'] = datetime.now().isoformat()
            
            # Add unique ID if not provided
            routine_id = routine_data.get('id', str(uuid.uuid4()))
            
            # Set the document with the specified ID
            doc_ref = self.db.collection('routines').document(routine_id)
            doc_ref.set(routine_data)
            
            return routine_id
        except Exception as e:
            print(f"Error creating routine: {e}")
            return None

    def update_routine(self, routine_id, routine_data):
        """Update a specific routine document."""
        try:
            # Add updated timestamp
            routine_data['updated_at'] = datetime.now().isoformat()
            
            doc_ref = self.db.collection('routines').document(routine_id)
            doc_ref.update(routine_data)
            
            return True
        except Exception as e:
            print(f"Error updating routine: {e}")
            return False

    def delete_routine(self, routine_id):
        """Delete a specific routine document."""
        try:
            # First delete all exercises associated with this routine
            exercises_ref = self.db.collection('exercises').where('routine_id', '==', routine_id)
            for doc in exercises_ref.stream():
                doc.reference.delete()
            
            # Then delete the routine itself
            doc_ref = self.db.collection('routines').document(routine_id)
            doc_ref.delete()
            
            return True
        except Exception as e:
            print(f"Error deleting routine: {e}")
            return False
            
    # Exercises Collection Methods
    
    def get_exercises(self, routine_id=None):
        """Get all exercises, optionally filtered by routine_id."""
        try:
            if routine_id:
                exercises_ref = self.db.collection('exercises').where('routine_id', '==', routine_id)
            else:
                exercises_ref = self.db.collection('exercises')
                
            exercises = []
            
            for doc in exercises_ref.stream():
                exercise_data = doc.to_dict()
                exercise_data['id'] = doc.id
                exercises.append(exercise_data)
                
            return exercises
        except Exception as e:
            print(f"Error getting exercises: {e}")
            return []

    def get_exercise(self, exercise_id):
        """Get a specific exercise by ID."""
        try:
            doc_ref = self.db.collection('exercises').document(exercise_id)
            doc = doc_ref.get()
            
            if doc.exists:
                exercise_data = doc.to_dict()
                exercise_data['id'] = doc.id
                return exercise_data
            else:
                return None
        except Exception as e:
            print(f"Error getting exercise: {e}")
            return None

    def create_exercise(self, exercise_data):
        """Create a new exercise document in Firestore."""
        try:
            # Ensure routine_id exists
            if 'routine_id' not in exercise_data:
                raise ValueError("routine_id is required for exercises")
                
            # Add timestamp
            exercise_data['created_at'] = datetime.now().isoformat()
            exercise_data['updated_at'] = datetime.now().isoformat()
            
            # Add unique ID if not provided
            exercise_id = exercise_data.get('id', str(uuid.uuid4()))
            
            # Set the document with the specified ID
            doc_ref = self.db.collection('exercises').document(exercise_id)
            doc_ref.set(exercise_data)
            
            return exercise_id
        except Exception as e:
            print(f"Error creating exercise: {e}")
            return None

    def update_exercise(self, exercise_id, exercise_data):
        """Update a specific exercise document."""
        try:
            # Add updated timestamp
            exercise_data['updated_at'] = datetime.now().isoformat()
            
            doc_ref = self.db.collection('exercises').document(exercise_id)
            doc_ref.update(exercise_data)
            
            return True
        except Exception as e:
            print(f"Error updating exercise: {e}")
            return False

    def delete_exercise(self, exercise_id):
        """Delete a specific exercise document."""
        try:
            doc_ref = self.db.collection('exercises').document(exercise_id)
            doc_ref.delete()
            
            return True
        except Exception as e:
            print(f"Error deleting exercise: {e}")
            return False
