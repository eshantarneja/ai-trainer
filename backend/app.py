from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import os
from dotenv import load_dotenv
from firebase_handler import FirebaseHandler

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase
firebase = FirebaseHandler()

@app.route('/', methods=['GET'])
def root():
    """Root endpoint that redirects to the health check endpoint."""
    return redirect('/api/health')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the API is running."""
    return jsonify({"status": "healthy", "message": "API is running"})

@app.route('/api/workouts', methods=['GET'])
def get_workouts():
    """Get all workouts for a user."""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    workouts = firebase.get_workouts(user_id)
    return jsonify({"workouts": workouts})

@app.route('/api/workouts', methods=['POST'])
def create_workout():
    """Create a new workout."""
    data = request.json
    
    # Validate required fields
    if not data.get('user_id') or not data.get('workout_data'):
        return jsonify({"error": "user_id and workout_data are required"}), 400
    
    workout_id = firebase.create_workout(data['user_id'], data['workout_data'])
    return jsonify({"message": "Workout created successfully", "workout_id": workout_id}), 201

@app.route('/api/workouts/<workout_id>', methods=['GET'])
def get_workout(workout_id):
    """Get a specific workout by ID."""
    workout = firebase.get_workout(workout_id)
    if not workout:
        return jsonify({"error": "Workout not found"}), 404
    
    return jsonify({"workout": workout})

@app.route('/api/workouts/<workout_id>', methods=['PUT'])
def update_workout(workout_id):
    """Update a specific workout."""
    data = request.json
    
    # Validate required fields
    if not data.get('workout_data'):
        return jsonify({"error": "workout_data is required"}), 400
    
    success = firebase.update_workout(workout_id, data['workout_data'])
    if not success:
        return jsonify({"error": "Failed to update workout"}), 500
    
    return jsonify({"message": "Workout updated successfully"})

@app.route('/api/workouts/<workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    """Delete a specific workout."""
    success = firebase.delete_workout(workout_id)
    if not success:
        return jsonify({"error": "Failed to delete workout"}), 500
    
    return jsonify({"message": "Workout deleted successfully"})

# Routines Endpoints

@app.route('/api/routines', methods=['GET'])
def get_routines():
    """Get all workout routines."""
    routines = firebase.get_routines()
    return jsonify({"routines": routines})

@app.route('/api/routines/<routine_id>', methods=['GET'])
def get_routine(routine_id):
    """Get a specific routine by ID."""
    routine = firebase.get_routine(routine_id)
    if not routine:
        return jsonify({"error": "Routine not found"}), 404
    
    return jsonify({"routine": routine})

@app.route('/api/routines', methods=['POST'])
def create_routine():
    """Create a new workout routine."""
    data = request.json
    
    # Validate required fields
    if not data.get('name'):
        return jsonify({"error": "name is required"}), 400
    
    routine_id = firebase.create_routine(data)
    return jsonify({"message": "Routine created successfully", "routine_id": routine_id}), 201

@app.route('/api/routines/<routine_id>', methods=['PUT'])
def update_routine(routine_id):
    """Update a specific routine."""
    data = request.json
    
    success = firebase.update_routine(routine_id, data)
    if not success:
        return jsonify({"error": "Failed to update routine"}), 500
    
    return jsonify({"message": "Routine updated successfully"})

@app.route('/api/routines/<routine_id>', methods=['DELETE'])
def delete_routine(routine_id):
    """Delete a specific routine."""
    success = firebase.delete_routine(routine_id)
    if not success:
        return jsonify({"error": "Failed to delete routine"}), 500
    
    return jsonify({"message": "Routine deleted successfully"})

# Exercises Endpoints

@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    """Get all exercises, optionally filtered by routine_id."""
    routine_id = request.args.get('routine_id')
    exercises = firebase.get_exercises(routine_id)
    return jsonify({"exercises": exercises})

@app.route('/api/exercises/<exercise_id>', methods=['GET'])
def get_exercise(exercise_id):
    """Get a specific exercise by ID."""
    exercise = firebase.get_exercise(exercise_id)
    if not exercise:
        return jsonify({"error": "Exercise not found"}), 404
    
    return jsonify({"exercise": exercise})

@app.route('/api/exercises', methods=['POST'])
def create_exercise():
    """Create a new exercise."""
    data = request.json
    
    # Validate required fields
    required_fields = ['routine_id', 'name', 'sets', 'reps', 'rest_time']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400
    
    exercise_id = firebase.create_exercise(data)
    return jsonify({"message": "Exercise created successfully", "exercise_id": exercise_id}), 201

@app.route('/api/exercises/<exercise_id>', methods=['PUT'])
def update_exercise(exercise_id):
    """Update a specific exercise."""
    data = request.json
    
    success = firebase.update_exercise(exercise_id, data)
    if not success:
        return jsonify({"error": "Failed to update exercise"}), 500
    
    return jsonify({"message": "Exercise updated successfully"})

@app.route('/api/exercises/<exercise_id>', methods=['DELETE'])
def delete_exercise(exercise_id):
    """Delete a specific exercise."""
    success = firebase.delete_exercise(exercise_id)
    if not success:
        return jsonify({"error": "Failed to delete exercise"}), 500
    
    return jsonify({"message": "Exercise deleted successfully"})

if __name__ == '__main__':
    # Get port from environment variable or use 5002 as default
    port = int(os.environ.get('PORT', 5002))
    # Run the app with host set to 0.0.0.0 to make it externally visible
    app.run(host='0.0.0.0', port=port, debug=True)
