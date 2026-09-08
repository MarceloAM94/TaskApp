"use server";

import { supabase } from "@/lib/supabase";
import type { Task, TaskWithCourse, TaskStatus } from "@/lib/types";

export async function getTasks(): Promise<TaskWithCourse[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, courses(*), subtasks(count)")
    .order("position");

  if (error) throw new Error(error.message);

  return (data ?? []).map((task) => {
    const { subtasks, ...rest } = task as TaskWithCourse & {
      subtasks: { count: number }[];
    };
    return { ...rest, subtask_count: subtasks?.[0]?.count ?? 0 };
  });
}

export type CreateTaskInput = Omit<
  Task,
  "id" | "created_at" | "completed_at" | "position" | "reminder_sent"
>;

export async function createTask(task: CreateTaskInput): Promise<Task> {
  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", task.status);

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...task, reminder_sent: false, position: count ?? 0 })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, "id" | "created_at">>
): Promise<Task> {
  if (updates.status) {
    if (updates.status === "done") {
      updates.completed_at = new Date().toISOString();
    } else if (updates.completed_at !== undefined) {
      updates.completed_at = null;
    }
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  position: number
): Promise<Task> {
  const updates: Partial<Task> = { status, position };

  if (status === "done") {
    updates.completed_at = new Date().toISOString();
  } else {
    updates.completed_at = null;
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateTaskPositions(
  updates: { id: string; status: TaskStatus; position: number }[]
): Promise<void> {
  for (const update of updates) {
    const taskUpdates: Partial<Task> = {
      status: update.status,
      position: update.position,
    };

    if (update.status === "done") {
      taskUpdates.completed_at = new Date().toISOString();
    } else {
      taskUpdates.completed_at = null;
    }

    const { error } = await supabase
      .from("tasks")
      .update(taskUpdates)
      .eq("id", update.id);

    if (error) throw new Error(error.message);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
