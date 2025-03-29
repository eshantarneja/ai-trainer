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
            # First delete all routine_exercises links associated with this routine
            routine_exercises_ref = self.db.collection('routine_exercises').where('routine_id', '==', routine_id)
            for doc in routine_exercises_ref.stream():
                doc.reference.delete()
            
            # Then delete the routine itself
            doc_ref = self.db.collection('routines').document(routine_id)
            doc_ref.delete()
            
            return True
        except Exception as e:
            print(f"Error deleting routine: {e}")
            return False
            
    # Exercises Collection Methods (catalog of exercises)
    
    def get_exercises(self, routine_id=None):
        """Get all exercises with their details.
        If routine_id is provided, returns exercises for that routine with their specific settings.
        """
        try:
            if routine_id:
                # Get the routine exercises (links between routines and exercises)
                # Removing order_by to avoid requiring composite index
                routine_exercises_ref = self.db.collection('routine_exercises').where('routine_id', '==', routine_id)
                routine_exercises = []
                
                # Collect all routine exercise documents
                for doc in routine_exercises_ref.stream():
                    re_data = doc.to_dict()
                    re_data['id'] = doc.id
                    routine_exercises.append(re_data)
                    
                # Sort in memory instead of in the query
                routine_exercises.sort(key=lambda x: x.get('order', 0))
                
                # For each routine exercise, get the base exercise details and merge
                exercises = []
                for re in routine_exercises:
                    # Get the base exercise
                    exercise_ref = self.db.collection('exercises').document(re['exercise_id'])
                    exercise_doc = exercise_ref.get()
                    
                    if exercise_doc.exists:
                        # Start with base exercise data
                        exercise_data = exercise_doc.to_dict()
                        exercise_data['id'] = exercise_doc.id
                        
                        # Override with routine-specific settings
                        exercise_data['routine_exercise_id'] = re['id']
                        exercise_data['sets'] = re.get('sets', exercise_data.get('default_sets', 0))
                        exercise_data['reps'] = re.get('reps', exercise_data.get('default_reps', 0))
                        exercise_data['rep_time'] = re.get('rep_time', exercise_data.get('default_rep_time', 3))
                        exercise_data['rest_time'] = re.get('rest_time', exercise_data.get('default_rest_time', 60))
                        exercise_data['order'] = re.get('order', 0)
                        
                        exercises.append(exercise_data)
                
                return exercises
            else:
                # Just return all exercises from the catalog
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
        """Get a specific exercise from the catalog by ID."""
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
            
    def get_routine_exercise(self, routine_exercise_id):
        """Get a specific routine-exercise link by ID with complete data."""
        try:
            re_ref = self.db.collection('routine_exercises').document(routine_exercise_id)
            re_doc = re_ref.get()
            
            if not re_doc.exists:
                return None
                
            re_data = re_doc.to_dict()
            re_data['id'] = re_doc.id
            
            # Get the base exercise
            exercise_ref = self.db.collection('exercises').document(re_data['exercise_id'])
            exercise_doc = exercise_ref.get()
            
            if exercise_doc.exists:
                # Start with base exercise data
                exercise_data = exercise_doc.to_dict()
                exercise_data['id'] = exercise_doc.id
                
                # Override with routine-specific settings
                exercise_data['routine_exercise_id'] = re_data['id']
                exercise_data['sets'] = re_data.get('sets', exercise_data.get('default_sets', 0))
                exercise_data['reps'] = re_data.get('reps', exercise_data.get('default_reps', 0))
                exercise_data['rep_time'] = re_data.get('rep_time', exercise_data.get('default_rep_time', 3))
                exercise_data['rest_time'] = re_data.get('rest_time', exercise_data.get('default_rest_time', 60))
                exercise_data['order'] = re_data.get('order', 0)
                
                return exercise_data
            else:
                return None
        except Exception as e:
            print(f"Error getting routine exercise: {e}")
            return None

    def create_exercise(self, exercise_data):
        """Create a new exercise in the catalog."""
        try:
            # Validate required fields
            required_fields = ['name']
            for field in required_fields:
                if field not in exercise_data:
                    print(f"Error: Missing required field '{field}'")
                    return None
            
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
            
    def create_routine_exercise(self, routine_exercise_data):
        """Create a link between routine and exercise with specific settings."""
        try:
            # Validate required fields
            required_fields = ['routine_id', 'exercise_id', 'order']
            for field in required_fields:
                if field not in routine_exercise_data:
                    print(f"Error: Missing required field '{field}'")
                    return None
            
            # Add timestamp
            routine_exercise_data['created_at'] = datetime.now().isoformat()
            routine_exercise_data['updated_at'] = datetime.now().isoformat()
            
            # Add unique ID if not provided
            routine_exercise_id = routine_exercise_data.get('id', str(uuid.uuid4()))
            
            # Set the document with the specified ID
            doc_ref = self.db.collection('routine_exercises').document(routine_exercise_id)
            doc_ref.set(routine_exercise_data)
            
            return routine_exercise_id
        except Exception as e:
            print(f"Error creating routine exercise link: {e}")
            return None

    def update_exercise(self, exercise_id, exercise_data):
        """Update a specific exercise in the catalog."""
        try:
            # Add updated timestamp
            exercise_data['updated_at'] = datetime.now().isoformat()
            
            doc_ref = self.db.collection('exercises').document(exercise_id)
            doc_ref.update(exercise_data)
            
            return True
        except Exception as e:
            print(f"Error updating exercise: {e}")
            return False
            
    def update_routine_exercise(self, routine_exercise_id, routine_exercise_data):
        """Update the link between routine and exercise."""
        try:
            # Add updated timestamp
            routine_exercise_data['updated_at'] = datetime.now().isoformat()
            
            doc_ref = self.db.collection('routine_exercises').document(routine_exercise_id)
            doc_ref.update(routine_exercise_data)
            
            return True
        except Exception as e:
            print(f"Error updating routine exercise link: {e}")
            return False

    def delete_exercise(self, exercise_id):
        """Delete a specific exercise from the catalog.
        Note: This won't delete routine_exercise links automatically.
        """
        try:
            doc_ref = self.db.collection('exercises').document(exercise_id)
            doc_ref.delete()
            
            return True
        except Exception as e:
            print(f"Error deleting exercise: {e}")
            return False
            
    def delete_routine_exercise(self, routine_exercise_id):
        """Delete a specific link between routine and exercise."""
        try:
            doc_ref = self.db.collection('routine_exercises').document(routine_exercise_id)
            doc_ref.delete()
            
            return True
        except Exception as e:
            print(f"Error deleting routine exercise link: {e}")
            return False
