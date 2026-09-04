"use server";

import { supabase } from "@/lib/supabase";
import type { Subtask } from "@/lib/types";

export async function getSubtasks(taskId: string): Promise<Subtask[]> {
  const { data, error } = await supabase
    .from("subtasks")
    .select("*")
    .eq("task_id", taskId)
    .order("position");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSubtask(
  subtask: Omit<Subtask, "id" | "is_done">
): Promise<Subtask> {
  const { data, error } = await supabase
    .from("subtasks")
    .insert({ ...subtask, is_done: false })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleSubtask(
  id: string,
  isDone: boolean
): Promise<Subtask> {
  const { data, error } = await supabase
    .from("subtasks")
    .update({ is_done: isDone })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSubtask(id: string): Promise<void> {
  const { error } = await supabase.from("subtasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
