"use server";

import { supabase } from "@/lib/supabase";
import type { PomodoroSession, PomodoroSessionType } from "@/lib/types";

export async function startSession(
  taskId: string,
  type: PomodoroSessionType
): Promise<PomodoroSession> {
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .insert({ task_id: taskId, type })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function completeSession(
  sessionId: string,
  durationSeconds: number,
  addToTask: boolean
): Promise<void> {
  const { error: sessionError } = await supabase
    .from("pomodoro_sessions")
    .update({ ended_at: new Date().toISOString(), duration_seconds: durationSeconds })
    .eq("id", sessionId)
    .is("ended_at", null);
  if (sessionError) throw new Error(sessionError.message);

  if (addToTask) {
    const { data: session, error: fetchError } = await supabase
      .from("pomodoro_sessions")
      .select("task_id")
      .eq("id", sessionId)
      .single();
    if (fetchError) throw new Error(fetchError.message);

    const { error: taskError } = await supabase.rpc("increment_time_spent", {
      task_id: session.task_id,
      seconds: durationSeconds,
    });
    if (taskError) throw new Error(taskError.message);
  }
}

export async function getActiveSession(taskId: string): Promise<PomodoroSession | null> {
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select("*")
    .eq("task_id", taskId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}