"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addExerciseToWorkoutAction,
  removeExerciseFromWorkoutAction,
  addSetAction,
  updateSetAction,
  deleteSetAction,
  createAndAddExerciseAction,
} from "./actions";

type Exercise = { id: string; name: string };
type Set = { id: string; setNumber: number; reps: number; weight: number };
type WorkoutExercise = { id: string; order: number };
type ExerciseEntry = { workoutExercise: WorkoutExercise; exercise: Exercise; sets: (Set | null)[] };

interface Props {
  workoutId: string;
  entries: ExerciseEntry[];
  allExercises: Exercise[];
}

export default function ExerciseLogger({ workoutId, entries, allExercises }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [newExerciseName, setNewExerciseName] = useState("");
  const [addingSetFor, setAddingSetFor] = useState<string | null>(null);
  const [addReps, setAddReps] = useState("");
  const [addWeight, setAddWeight] = useState("");
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");

  function openEditSet(s: Set) {
    setEditingSetId(s.id);
    setEditReps(String(s.reps));
    setEditWeight(String(s.weight));
    setAddingSetFor(null);
  }

  function handleAddExercise() {
    const trimmedName = newExerciseName.trim();
    const exerciseId = selectedExerciseId;
    if (!trimmedName && !exerciseId) return;
    setError(null);
    startTransition(async () => {
      try {
        if (trimmedName) {
          await createAndAddExerciseAction(workoutId, trimmedName);
        } else if (exerciseId) {
          await addExerciseToWorkoutAction(workoutId, exerciseId);
        } else {
          return;
        }
        setShowAddExercise(false);
        setSelectedExerciseId("");
        setNewExerciseName("");

      } catch {
        setError("Failed to add exercise. Please try again.");
      }
    });
  }

  function handleRemoveExercise(workoutExerciseId: string, exerciseName: string) {
    if (!confirm(`Delete "${exerciseName}" and all its sets?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await removeExerciseFromWorkoutAction(workoutExerciseId, workoutId);

      } catch {
        setError("Failed to remove exercise. Please try again.");
      }
    });
  }

  function handleAddSet(workoutExerciseId: string) {
    const reps = parseInt(addReps, 10);
    const weight = parseFloat(addWeight);
    if (!reps || isNaN(weight)) {
      setError("Please enter reps and weight before logging a set.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await addSetAction(workoutExerciseId, reps, weight, workoutId);
        setAddingSetFor(null);
        setAddReps("");
        setAddWeight("");

      } catch {
        setError("Failed to save set. Please try again.");
      }
    });
  }

  function handleUpdateSet(setId: string) {
    const reps = parseInt(editReps, 10);
    const weight = parseFloat(editWeight);
    if (!reps || isNaN(weight)) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateSetAction(setId, reps, weight, workoutId);
        setEditingSetId(null);

      } catch {
        setError("Failed to update set. Please try again.");
      }
    });
  }

  function handleDeleteSet(setId: string, setNumber: number) {
    if (!confirm(`Delete Set ${setNumber}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteSetAction(setId, workoutId);
        if (editingSetId === setId) setEditingSetId(null);

      } catch {
        setError("Failed to delete set. Please try again.");
      }
    });
  }

  const addedExerciseIds = new Set(entries.map((e) => e.exercise.id));
  const availableExercises = allExercises.filter((e) => !addedExerciseIds.has(e.id));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Exercises</h2>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">No exercises logged yet.</p>
      )}

      {entries.map(({ workoutExercise, exercise, sets: exerciseSets }) => {
        const validSets = exerciseSets.filter((s): s is Set => s !== null);
        return (
          <Card key={workoutExercise.id}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">{exercise.name}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleRemoveExercise(workoutExercise.id, exercise.name)}
                disabled={isPending}
              >
                Delete
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {validSets.length === 0 && (
                <p className="text-sm text-muted-foreground">No sets logged.</p>
              )}
              {validSets.map((s) =>
                editingSetId === s.id ? (
                  <div key={s.id} className="flex gap-2 items-end pt-1">
                    <div className="space-y-1">
                      <Label className="text-xs">Reps</Label>
                      <Input
                        type="number"
                        min={1}
                        className="w-20 h-8"
                        value={editReps}
                        onChange={(e) => setEditReps(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Weight (kg)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        className="w-24 h-8"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => handleUpdateSet(s.id)}
                      disabled={isPending}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => setEditingSetId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span>
                      Set {s.setNumber}: {s.weight}kg × {s.reps} reps
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => openEditSet(s)}
                        disabled={isPending}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSet(s.id, s.setNumber)}
                        disabled={isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )
              )}

              {addingSetFor === workoutExercise.id ? (
                <div className="flex gap-2 items-end pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Reps</Label>
                    <Input
                      type="number"
                      min={1}
                      className="w-20 h-8"
                      value={addReps}
                      onChange={(e) => setAddReps(e.target.value)}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Weight (kg)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      className="w-24 h-8"
                      value={addWeight}
                      onChange={(e) => setAddWeight(e.target.value)}
                      placeholder="60"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => handleAddSet(workoutExercise.id)}
                    disabled={isPending}
                  >
                    Log Set
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setAddingSetFor(null);
                      setAddReps("");
                      setAddWeight("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAddingSetFor(workoutExercise.id);
                    setEditingSetId(null);
                  }}
                  disabled={isPending}
                >
                  + Add Set
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      {showAddExercise ? (
        <Card>
          <CardContent className="pt-4 space-y-3">
            {availableExercises.length > 0 && (
              <div className="space-y-1">
                <Label className="text-sm">Select existing exercise</Label>
                <select
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={selectedExerciseId}
                  onChange={(e) => {
                    setSelectedExerciseId(e.target.value);
                    setNewExerciseName("");
                  }}
                >
                  <option value="">— choose —</option>
                  {availableExercises.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-sm">Or create new exercise</Label>
              <Input
                placeholder="Exercise name"
                value={newExerciseName}
                onChange={(e) => {
                  setNewExerciseName(e.target.value);
                  setSelectedExerciseId("");
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddExercise}
                disabled={isPending || (!selectedExerciseId && !newExerciseName.trim())}
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddExercise(false);
                  setSelectedExerciseId("");
                  setNewExerciseName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowAddExercise(true)} disabled={isPending}>
          + Add Exercise
        </Button>
      )}
    </div>
  );
}
