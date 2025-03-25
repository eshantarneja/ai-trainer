"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { createWorkout, Exercise, Set } from "@/lib/workout-api";
import { PlusIcon, Trash2Icon, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Mock user ID - in a real app, you would get this from authentication
const MOCK_USER_ID = "user123";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, { message: "Workout name must be at least 3 characters" }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  notes: z.string().optional(),
  exercises: z.array(
    z.object({
      name: z.string().min(2, { message: "Exercise name required" }),
      sets: z.array(
        z.object({
          reps: z.number().optional(),
          weight: z.number().optional(),
          completed: z.boolean().default(false),
        })
      ).min(1, { message: "At least one set is required" }),
      notes: z.string().optional(),
    })
  ).min(1, { message: "At least one exercise is required" }),
});

export default function CreateWorkoutPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
      exercises: [
        {
          name: "",
          sets: [{ reps: 10, weight: 0, completed: false }],
          notes: "",
        },
      ],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const workoutId = await createWorkout(MOCK_USER_ID, values);
      if (workoutId) {
        toast.success("Workout created successfully");
        router.push("/workouts");
      } else {
        toast.error("Failed to create workout");
      }
    } catch (error) {
      console.error("Error creating workout:", error);
      toast.error("An error occurred while creating the workout");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Add a new exercise
  const addExercise = () => {
    const currentExercises = form.getValues("exercises");
    form.setValue("exercises", [
      ...currentExercises,
      {
        name: "",
        sets: [{ reps: 10, weight: 0, completed: false }],
        notes: "",
      },
    ]);
  };

  // Remove an exercise
  const removeExercise = (index: number) => {
    const currentExercises = form.getValues("exercises");
    if (currentExercises.length > 1) {
      form.setValue(
        "exercises",
        currentExercises.filter((_, i) => i !== index)
      );
    }
  };

  // Add a set to an exercise
  const addSet = (exerciseIndex: number) => {
    const currentExercises = form.getValues("exercises");
    const exerciseSets = currentExercises[exerciseIndex].sets;
    
    // Copy the last set's values or use default
    const lastSet = exerciseSets[exerciseSets.length - 1];
    const newSet = lastSet ? 
      { ...lastSet, completed: false } : 
      { reps: 10, weight: 0, completed: false };
    
    currentExercises[exerciseIndex].sets = [...exerciseSets, newSet];
    form.setValue("exercises", currentExercises);
  };

  // Remove a set from an exercise
  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const currentExercises = form.getValues("exercises");
    const exerciseSets = currentExercises[exerciseIndex].sets;
    
    if (exerciseSets.length > 1) {
      currentExercises[exerciseIndex].sets = exerciseSets.filter(
        (_, i) => i !== setIndex
      );
      form.setValue("exercises", currentExercises);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/workouts" className="flex items-center text-sm hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Workouts
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Create New Workout</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Morning Strength Training" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any notes about this workout..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Exercises</h2>
              <Button 
                type="button" 
                variant="outline" 
                onClick={addExercise}
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            {form.getValues("exercises").map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Exercise {exerciseIndex + 1}</CardTitle>
                    {form.getValues("exercises").length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(exerciseIndex)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`exercises.${exerciseIndex}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Bench Press" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Sets</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSet(exerciseIndex)}
                        className="text-sm"
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Add Set
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium px-1">
                      <div className="col-span-1">#</div>
                      <div className="col-span-4">Reps</div>
                      <div className="col-span-5">Weight (kg/lbs)</div>
                      <div className="col-span-2"></div>
                    </div>
                    
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1 text-gray-500 text-sm">
                          {setIndex + 1}
                        </div>
                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    className="h-8"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-5">
                          <FormField
                            control={form.control}
                            name={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    className="h-8"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          {exercise.sets.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`exercises.${exerciseIndex}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any notes about this exercise..." 
                            {...field} 
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/workouts")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Workout"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
