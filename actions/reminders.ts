"use server";

import { supabase } from "@/lib/supabase";

export interface DueReminder {
  id: string;
  title: string;
}

interface ReminderCandidate {
  id: string;
  title: string;
  due_date: string;
  reminder_offset_hours: number;
}

export async function getDueReminders(): Promise<DueReminder[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, due_date, reminder_offset_hours")
    .not("reminder_offset_hours", "is", null)
    .eq("reminder_sent", false)
    .not("status", "eq", "done")
    .not("due_date", "is", null);

  if (error) throw new Error(error.message);

  const candidates = (data ?? []) as unknown as ReminderCandidate[];
  const now = Date.now();

  return candidates
    .filter((task) => {
      // El vencimiento se trata como el fin del día de due_date (fecha sin hora).
      const due = new Date(`${task.due_date}T23:59:59.999`);
      const boundary = due.getTime() - task.reminder_offset_hours * 3_600_000;
      return now >= boundary;
    })
    .map(({ id, title }) => ({ id, title }));
}

export async function markRemindersSent(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const { error } = await supabase
    .from("tasks")
    .update({ reminder_sent: true })
    .in("id", ids);

  if (error) throw new Error(error.message);
}