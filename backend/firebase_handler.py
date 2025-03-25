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
