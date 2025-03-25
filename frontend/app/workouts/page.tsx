"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserWorkouts, Workout } from "@/lib/workout-api";
import { CalendarIcon, PlusIcon, Dumbbell } from "lucide-react";
import { format } from "date-fns";

// Mock user ID - in a real app, you would get this from authentication
const MOCK_USER_ID = "user123";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const data = await getUserWorkouts(MOCK_USER_ID);
        setWorkouts(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load workouts");
        setLoading(false);
        console.error(err);
      }
    }

    fetchWorkouts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Workouts</h1>
        <p>Loading workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Workouts</h1>
        <p className="text-red-500">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // If no workouts, show empty state
  if (workouts.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Workouts</h1>
          <Link href="/workouts/create">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Workout
            </Button>
          </Link>
        </div>
        
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No workouts yet</h3>
            <p className="text-gray-500 mb-4">
              Start tracking your fitness journey by creating your first workout.
            </p>
            <Link href="/workouts/create">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Workout
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <Link href="/workouts/create">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Workout
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workouts.map((workout) => (
          <Link href={`/workouts/${workout.id}`} key={workout.id}>
            <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>{workout.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(new Date(workout.date), "PPP")}
                </div>
                <div className="text-sm">
                  {workout.exercises?.length || 0} exercises
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
