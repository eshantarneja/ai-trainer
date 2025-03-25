export interface Exercise {
  name: string
  sets: number
  reps: number | string
  rest: string
  image: string
  notes?: string
  setType?: "straight" | "superset"
  supersetId?: string
  supersetOrder?: string // 'A', 'B', etc.
  supersetRounds?: number
  duration?: string // For timed exercises like cardio
}

export interface WorkoutRoutine {
  id: string
  name: string
  description: string
  duration: number
  exercises: Exercise[]
}

export const workoutRoutines: WorkoutRoutine[] = [
  {
    id: "push",
    name: "Push",
    description: "Focus on chest, shoulders, and triceps",
    duration: 45,
    exercises: [
      {
        name: "Flat Bench Press",
        sets: 4,
        reps: 12,
        rest: "1 min 30 sec",
        image: "/placeholder.svg?height=80&width=80",
        notes: "Keep your feet flat on the floor and maintain a slight arch in your lower back",
        setType: "straight",
      },
      {
        name: "Dumbbell Shoulder Press",
        sets: 3,
        reps: 10,
        rest: "1 min 30 sec",
        image: "/placeholder.svg?height=80&width=80",
        notes: "Keep your core tight and avoid arching your back",
        setType: "straight",
      },
      {
        name: "Incline Dumbbell Press",
        sets: 3,
        reps: 12,
        rest: "1 min 30 sec",
        image: "/placeholder.svg?height=80&width=80",
        setType: "straight",
      },
      {
        name: "Tricep Pushdowns",
        sets: 3,
        reps: 15,
        rest: "1 min 30 sec",
        image: "/placeholder.svg?height=80&width=80",
        notes: "Keep elbows close to your body",
        setType: "superset",
        supersetId: "triceps-superset",
        supersetOrder: "A",
        supersetRounds: 3,
      },
      {
        name: "Overhead Tricep Extension",
        sets: 3,
        reps: 12,
        rest: "1 min 30 sec",
        image: "/placeholder.svg?height=80&width=80",
        setType: "superset",
        supersetId: "triceps-superset",
        supersetOrder: "B",
        supersetRounds: 3,
      },
      {
        name: "Lateral Raises",
        sets: 3,
        reps: "12-15",
        rest: "1 min",
        image: "/placeholder.svg?height=80&width=80",
        setType: "straight",
      },
    ],
  },
  {
    id: "pull",
    name: "Pull",
    description: "Focus on back and biceps",
    duration: 50,
    exercises: [
      {
        name: "Close-Grip Front Lat Pulldown",
        sets: 3,
        reps: 12,
        rest: "1 min 30 sec",
        image: "/placeholder.svg?height=80&width=80",
        setType: "straight",
      },
      {
        name: "Incline Dumbbell Bicep Curl",
        sets: 3,
        reps: 12,
        rest: "1 min 30 sec",
        image: "/placeholder.svg?height=80&width=80",
        setType: "straight",
      },
      {
        name: "Standing Barbell Bicep Curl",
        sets: 3,
        reps: 12,
        rest: "1 min 30 sec",
        image: "/placeholder.svg?height=80&width=80",
        setType: "straight",
      },
      {
        name: "Bent Over Rows",
        sets: 3,
        reps: 12,
        rest: "1 min 30 sec",
        image: "/placeholder.svg?height=80&width=80",
        notes: "Keep your back straight and core engaged",
        setType: "straight",
      },
      {
        name: "Abs Superset",
        supersetRounds: 3,
        sets: 3,
        reps: 0, // Not used for the superset header
        rest: "",
        image: "",
        setType: "superset",
        supersetId: "abs-superset",
      },
      {
        name: "Hanging Leg Raise",
        sets: 0, // Not used for superset exercises
        reps: 15,
        rest: "",
        image: "/placeholder.svg?height=80&width=80",
        setType: "superset",
        supersetId: "abs-superset",
        supersetOrder: "A",
      },
      {
        name: "Ab Wheel Rollout",
        sets: 0, // Not used for superset exercises
        reps: 12,
        rest: "30 sec",
        image: "/placeholder.svg?height=80&width=80",
        setType: "superset",
        supersetId: "abs-superset",
        supersetOrder: "B",
      },
      {
        name: "Treadmill",
        sets: 1,
        reps: 0,
        rest: "",
        image: "/placeholder.svg?height=80&width=80",
        duration: "20 min",
        setType: "straight",
      },
    ],
  },
  {
    id: "legs",
    name: "Legs",
    description: "Focus on quadriceps, hamstrings, and calves",
    duration: 55,
    exercises: [
      {
        name: "Squats",
        sets: 4,
        reps: 10,
        rest: "2 min",
        image: "/placeholder.svg?height=80&width=80",
        notes: "Keep your chest up and knees tracking over toes",
        setType: "straight",
      },
      {
        name: "Romanian Deadlifts",
        sets: 3,
        reps: 12,
        rest: "1 min 30 sec",
        image: "/placeholder.svg?height=80&width=80",
        notes: "Focus on the hip hinge movement",
        setType: "straight",
      },
      {
        name: "Leg Press",
        sets: 3,
        reps: 12,
        rest: "1 min 30 sec",
        image: "/placeholder.svg?height=80&width=80",
        setType: "straight",
      },
      {
        name: "Calf Superset",
        supersetRounds: 3,
        sets: 3,
        reps: 0,
        rest: "",
        image: "",
        setType: "superset",
        supersetId: "calf-superset",
      },
      {
        name: "Standing Calf Raises",
        sets: 0,
        reps: 15,
        rest: "",
        image: "/placeholder.svg?height=80&width=80",
        setType: "superset",
        supersetId: "calf-superset",
        supersetOrder: "A",
      },
      {
        name: "Seated Calf Raises",
        sets: 0,
        reps: 15,
        rest: "1 min",
        image: "/placeholder.svg?height=80&width=80",
        setType: "superset",
        supersetId: "calf-superset",
        supersetOrder: "B",
      },
      {
        name: "Walking Lunges",
        sets: 3,
        reps: "10 each leg",
        rest: "1 min",
        image: "/placeholder.svg?height=80&width=80",
        setType: "straight",
      },
    ],
  },
]

