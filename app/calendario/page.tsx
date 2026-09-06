import CalendarView from "@/components/calendar/CalendarView";
import { getTasks } from "@/actions/tasks";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const tasks = await getTasks();

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <CalendarView initialTasks={tasks} />
    </main>
  );
}