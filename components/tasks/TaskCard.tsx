import { format, isPast, isToday, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";
import Badge from "@/components/ui/Badge";
import type { TaskWithCourse } from "@/lib/types";

const priorityStyles: Record<string, { label: string; className: string }> = {
  high: { label: "Alta", className: "bg-red-500/15 text-red-400" },
  medium: { label: "Media", className: "bg-amber-500/15 text-amber-400" },
  low: { label: "Baja", className: "bg-sky-500/15 text-sky-400" },
};

function getDueDateAlert(dueDate: string, status: string) {
  if (status === "done" || !dueDate) return null;

  const date = new Date(dueDate + "T00:00:00");
  if (isPast(date) && !isToday(date)) {
    return {
      label: `Vencida · ${format(date, "d MMM", { locale: es })}`,
      className: "text-red-400 bg-red-500/10 border-red-500/30",
    };
  }

  const daysLeft = differenceInCalendarDays(date, new Date());
  if (daysLeft <= 2) {
    return {
      label: `Vence ${isToday(date) ? "hoy" : format(date, "d MMM", { locale: es })}`,
      className: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    };
  }

  return {
    label: format(date, "d MMM", { locale: es }),
    className: "text-zinc-400 border-zinc-700",
  };
}

interface TaskCardProps {
  task: TaskWithCourse;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const priority = priorityStyles[task.priority];
  const dueAlert = getDueDateAlert(task.due_date ?? "", task.status);
  const hasProgress = task.progress > 0 && task.status !== "done";

  return (
    <button
      onClick={onClick}
      className="group w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-800/60 p-3 text-left transition-all hover:border-zinc-700 hover:bg-zinc-800"
    >
      <div className="flex items-start gap-2">
        {task.courses && (
          <span
            className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: task.courses.color }}
          />
        )}
        <h3 className="flex-1 text-sm font-medium leading-snug text-zinc-100">
          {task.title}
        </h3>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {task.courses ? (
          <Badge className="bg-zinc-700/50 text-zinc-300">
            {task.courses.name}
          </Badge>
        ) : (
          <Badge className="bg-zinc-700/30 text-zinc-500">Sin curso</Badge>
        )}
        <Badge className={priority.className}>{priority.label}</Badge>
      </div>

      {task.due_date && (
        <div
          className={`mt-2 inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs ${dueAlert?.className}`}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {dueAlert?.label}
        </div>
      )}

      {hasProgress && (
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-700">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <p className="mt-1 text-right text-[10px] text-zinc-500">
            {task.progress}%
          </p>
        </div>
      )}
    </button>
  );
}
