# AI Personal Trainer Roadmap

This document tracks the development progress and future plans for the AI Personal Trainer application, focusing on voice-guided workouts and AI-generated workout plans.

## ✅ Completed Tasks (Foundation)

### Database & Backend
- ✅ Implemented normalized database schema with separate collections for routines and exercises
- ✅ Created Firebase handler with methods to fetch routines and exercises
- ✅ Modified backend API to support the new schema
- ✅ Optimized exercise fetching to avoid requiring composite indexes
- ✅ Set up proper environment variable handling with dotenv
- ✅ Created diagnostic scripts for testing Firebase connections

### Frontend
- ✅ Updated frontend API interfaces to work with the new schema
- ✅ Implemented routine listing page
- ✅ Created detailed routine view with exercise list
- ✅ Built workout flow with exercise and rest views
- ✅ Fixed rest timer to correctly show the next exercise/set
- ✅ Updated to use Next.js 15 route parameter handling (useParams)
- ✅ Added proper error handling for API requests

### DevOps & Security
- ✅ Set up proper .gitignore to exclude sensitive files
- ✅ Secured Firebase credentials
- ✅ Implemented version control with Git

## 🔲 AI Personal Trainer Development Path

### Phase 1: Voice-Guided Workouts (Basic)
- 🔲 Add pre-recorded audio prompts for standard workout guidance
  - "Start your set now"
  - "Take a deep breath"
  - "Rest period begins"
  - "10 seconds remaining"
  - "Great job completing this exercise"
- 🔲 Implement audio playback system in the workout flow
- 🔲 Create audio controls (mute/unmute, volume)
- 🔲 Add basic exercise images for form guidance

### Phase 2: AI Workout Creation (Basic)
- 🔲 Create schema for AI-generated workout plans
- 🔲 Build workout creation form with options for:
  - Workout duration
  - Available equipment
  - Fitness goals (strength, endurance, etc.)
  - Experience level
- 🔲 Integrate GPT-4 API for generating basic workouts based on constraints
- 🔲 Store and display AI-generated workouts in the same format as preset routines

### Phase 3: Voice Guidance Enhancement
- 🔲 Integrate ElevenLabs API for text-to-speech conversion
- 🔲 Generate exercise-specific voice guidance:
  - Form cues for specific exercises
  - Encouragement based on exercise difficulty
  - Breathing guidance appropriate to the movement
- 🔲 Add multiple voice options/personas (coach, friend, drill sergeant)
- 🔲 Implement caching system for generated audio to reduce API costs

### Phase 4: Advanced AI Workout Generation
- 🔲 Enhance AI workout generation with more personalization options
- 🔲 Add support for generating workout progressions (multi-week plans)
- 🔲 Implement workout validation to ensure balanced and safe routines
- 🔲 Allow users to regenerate or tweak parts of AI-suggested workouts
- 🔲 Create specialized workout types (HIIT, strength, mobility, etc.)

### Phase 5: Full AI Personal Trainer Experience
- 🔲 Implement user profiles with workout history and preferences
- 🔲 Create AI-generated personalized voice guidance based on user progress
- 🔲 Add dynamic feedback during workouts (pace adjustments, form reminders)
- 🔲 Implement progress tracking and AI-adjusted difficulty
- 🔲 Add conversational interface for modifying workouts mid-session

## Technical Implementation Notes

### Voice Guidance System
- Initial implementation will use simple pre-recorded audio files
- Audio will be triggered based on workout state (start, during exercise, rest, completion)
- ElevenLabs integration will use their API for text-to-speech conversion
- Consider implementing a voice cache to avoid regenerating common phrases

### AI Workout Generation
- Will use GPT-4 API with carefully crafted prompts
- System needs to validate generated workouts for safety and effectiveness
- Schema should include:
  - Exercise selection with proper ordering
  - Sets, reps, and rest periods appropriate to goals
  - Warm-up and cool-down components
  - Form tips and audio guidance scripts

### User Preferences and Progress
- Store user constraints (equipment, time, injuries, goals)
- Track completed workouts to inform future recommendations
- Allow saving favorite workouts and exercises

## How to Contribute

To contribute to this roadmap or implement a feature:

1. Choose a task from one of the phases
2. Create a new branch with a descriptive name
3. Implement the feature
4. Write tests if applicable
5. Submit a pull request
6. Update this roadmap document to move the task to "Completed Tasks"
