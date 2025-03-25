import Link from "next/link"
import Image from "next/image"
import { workoutRoutines } from "@/lib/workout-data"
import { notFound } from "next/navigation"

export default function RoutinePage({ params }: { params: { routine: string } }) {
  const routine = workoutRoutines.find((r) => r.id === params.routine)

  if (!routine) {
    notFound()
  }

  // Group exercises by superset
  const groupedExercises = routine.exercises.reduce((acc, exercise, index) => {
    if (exercise.setType === "superset" && !exercise.supersetOrder) {
      // This is a superset header
      acc.push({
        type: "supersetHeader",
        name: exercise.name,
        rounds: exercise.supersetRounds,
        supersetId: exercise.supersetId,
        exercises: [],
      })
    } else if (exercise.setType === "superset" && exercise.supersetOrder) {
      // Find the superset this belongs to
      const supersetIndex = acc.findIndex(
        (group) => group.type === "supersetHeader" && group.supersetId === exercise.supersetId,
      )

      if (supersetIndex !== -1) {
        acc[supersetIndex].exercises.push(exercise)
      } else {
        // If no header found, just add as a regular exercise
        acc.push({
          type: "exercise",
          exercise,
        })
      }
    } else {
      // Regular straight set exercise
      acc.push({
        type: "exercise",
        exercise,
      })
    }

    return acc
  }, [] as any[])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white py-4 px-4 border-b">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-left"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold">{routine.name}</h1>
          <div className="flex items-center space-x-4">
            <button className="text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-calendar"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </button>
            <button className="text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-settings"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        <div className="space-y-4">
          {groupedExercises.map((group, groupIndex) => {
            if (group.type === "supersetHeader") {
              return (
                <div key={groupIndex} className="space-y-2">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                    <span className="ml-2 text-gray-500">{group.rounds} rounds</span>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                    {group.exercises.map((exercise, exIndex) => (
                      <div key={exIndex} className={exIndex !== 0 ? "border-t" : ""}>
                        <div className="p-4 flex">
                          <div className="mr-4">
                            <Image
                              src={exercise.image || "/placeholder.svg"}
                              alt={exercise.name}
                              width={80}
                              height={80}
                              className="rounded-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="text-lg font-medium">{exercise.name}</h4>
                              <span className="bg-gray-100 h-8 w-8 flex items-center justify-center rounded-full font-medium">
                                {exercise.supersetOrder}
                              </span>
                            </div>
                            <p className="text-gray-500">
                              {exercise.reps} reps
                              {exercise.rest && ` • ${exercise.rest} rest`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            } else {
              // Regular exercise
              const { exercise } = group
              return (
                <div key={groupIndex} className="space-y-2">
                  {exercise.setType === "straight" && <h3 className="text-lg font-semibold">Straight set</h3>}

                  <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 flex">
                      <div className="mr-4">
                        <Image
                          src={exercise.image || "/placeholder.svg"}
                          alt={exercise.name}
                          width={80}
                          height={80}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium">{exercise.name}</h4>
                        <p className="text-gray-500">
                          {exercise.duration
                            ? `${exercise.sets} set • ${exercise.duration}`
                            : `${exercise.sets} sets • ${exercise.reps} reps • ${exercise.rest} rest`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          })}
        </div>
      </main>
    </div>
  )
}

