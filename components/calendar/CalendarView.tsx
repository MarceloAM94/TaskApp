"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import Badge from "@/components/ui/Badge";
import type { TaskWithCourse, TaskStatus } from "@/lib/types";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-sky-400",
};

const statusMeta: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-sky-500/15 text-sky-400" },
  in_progress: { label: "En desarrollo", className: "bg-amber-500/15 text-amber-400" },
  done: { label: "Terminado", className: "bg-emerald-500/15 text-emerald-400" },
};

const btnClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100";

interface CalendarViewProps {
  initialTasks: TaskWithCourse[];
}

function dueLabel(dateStr: string, done: boolean) {
  if (done) return "Completada";
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const isTodayDate = isSameDay(date, today);
  if (isTodayDate) return "Vence hoy";
  if (date < today) return "Vencida";
  return `Vence el ${format(date, "d MMM", { locale: es })}`;
}

export default function CalendarView({ initialTasks }: CalendarViewProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date | null>(null);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskWithCourse[]>();
    for (const task of initialTasks) {
      if (!task.due_date) continue;
      const list = map.get(task.due_date) ?? [];
      list.push(task);
      map.set(task.due_date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (b.status === "done" && a.status !== "done") return -1;
        if (a.due_date !== b.due_date) return 0;
        return a.title.localeCompare(b.title);
      });
    }
    return map;
  }, [initialTasks]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const monthLabel = format(month, "MMMM yyyy", { locale: es });

  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedTasks = selectedKey ? tasksByDate.get(selectedKey) ?? [] : [];

  const goToToday = () => {
    const today = new Date();
    setMonth(startOfMonth(today));
    setSelected(today);
  };

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Calendario</h1>
          <p className="text-sm text-zinc-500">Vencimientos de tus tareas por día</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-zinc-100">
            Hoy
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => setMonth((m) => addMonths(m, -1))} className={btnClass} aria-label="Mes anterior">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="min-w-[150px] text-center text-sm font-semibold capitalize text-zinc-200">
              {monthLabel}
            </span>
            <button onClick={() => setMonth((m) => addMonths(m, 1))} className={btnClass} aria-label="Mes siguiente">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-4 sm:px-6 lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <div className="grid shrink-0 grid-cols-7 border-b border-zinc-800">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                {d}
              </div>
            ))}
          </div>

          <div className="grid flex-1 auto-rows-fr grid-cols-7">
            {days.map((day) => {
              const inMonth = isSameMonth(day, month);
              const dayTasks = tasksByDate.get(format(day, "yyyy-MM-dd")) ?? [];
              const isSel = selected ? isSameDay(day, selected) : false;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelected(day)}
                  className={`flex min-h-[52px] flex-col items-center gap-1 border-b border-r border-zinc-800/50 p-1.5 transition-colors ${
                    inMonth ? "hover:bg-zinc-800/40" : "hover:bg-zinc-900"
                  } ${isSel ? "bg-violet-500/10" : ""}`}
                >
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday(day)
                        ? "bg-violet-600 font-bold text-white"
                        : inMonth
                          ? "text-zinc-300"
                          : "text-zinc-600"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-0.5">
                    {dayTasks.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className={`h-1.5 w-1.5 rounded-full ${priorityDot[t.priority]} ${
                          t.status === "done" ? "opacity-40" : ""
                        }`}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] leading-none text-zinc-500">
                        +{dayTasks.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 lg:w-80">
          <div className="border-b border-zinc-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-200">
              {selected ? format(selected, "EEEE, d 'de' MMMM", { locale: es }) : "Selecciona un día"}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {selectedTasks.length} {selectedTasks.length === 1 ? "tarea" : "tareas"} con vencimiento
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
            {selectedTasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600">
                Sin vencimientos este día
              </p>
            ) : (
              selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-xl border border-zinc-800 bg-zinc-800/40 p-3 ${
                    task.status === "done" ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${priorityDot[task.priority]}`} />
                    <h3 className="flex-1 text-sm font-medium leading-snug text-zinc-100">
                      {task.title}
                    </h3>
                    <span className="text-[10px] text-zinc-500">{dueLabel(task.due_date!, task.status === "done")}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {task.courses ? (
                      <Badge className="bg-zinc-700/50 text-zinc-300">{task.courses.name}</Badge>
                    ) : (
                      <Badge className="bg-zinc-700/30 text-zinc-500">Sin curso</Badge>
                    )}
                    <Badge className={statusMeta[task.status].className}>
                      {statusMeta[task.status].label}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}