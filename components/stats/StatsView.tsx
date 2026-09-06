"use client";

import { useMemo } from "react";
import {
  differenceInCalendarDays,
  eachWeekOfInterval,
  format,
  isPast,
  isToday,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import type { Course, TaskStatus, TaskWithCourse } from "@/lib/types";

const statusColors: Record<TaskStatus, string> = {
  pending: "#38bdf8",
  in_progress: "#f59e0b",
  done: "#34d399",
};

const statusMeta: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: "Pendientes", className: "text-sky-400" },
  in_progress: { label: "En desarrollo", className: "text-amber-400" },
  done: { label: "Terminadas", className: "text-emerald-400" },
};

interface StatsViewProps {
  initialTasks: TaskWithCourse[];
  courses: Course[];
}

export default function StatsView({ initialTasks, courses }: StatsViewProps) {
  const stats = useMemo(() => {
    const total = initialTasks.length;
    const byStatus: Record<TaskStatus, number> = {
      pending: 0,
      in_progress: 0,
      done: 0,
    };

    let overdue = 0;
    let dueSoon = 0;
    const today = new Date();

    for (const task of initialTasks) {
      byStatus[task.status] += 1;
      if (task.status === "done" || !task.due_date) continue;

      const due = new Date(task.due_date + "T00:00:00");
      if (isPast(due) && !isToday(due)) {
        overdue += 1;
      } else if (differenceInCalendarDays(due, today) <= 2) {
        dueSoon += 1;
      }
    }

    const byCourse = new Map<string, { count: number; color: string }>();
    for (const task of initialTasks) {
      const key = task.courses ? task.courses.id : "none";
      const current = byCourse.get(key);
      const color = task.courses ? task.courses.color : "#52525b";
      byCourse.set(key, {
        count: (current?.count ?? 0) + 1,
        color,
      });
    }

    const weeks = eachWeekOfInterval(
      { start: startOfWeek(subWeeks(today, 5), { weekStartsOn: 1 }), end: startOfWeek(today, { weekStartsOn: 1 }) },
      { weekStartsOn: 1 }
    );

    const byWeek = weeks.map((weekStart) => {
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const completed = initialTasks.filter(
        (t) =>
          t.completed_at &&
          t.completed_at <= format(weekEnd, "yyyy-MM-dd") + "T23:59:59.999Z" &&
          t.completed_at >= weekStartStr + "T00:00:00.000Z"
      ).length;
      return { label: format(weekStart, "d MMM", { locale: es }), value: completed };
    });

    const completion = total > 0 ? Math.round((byStatus.done / total) * 100) : 0;

    return {
      total,
      byStatus,
      overdue,
      dueSoon,
      byCourse,
      byWeek,
      completion,
    };
  }, [initialTasks]);

  const courseRows = useMemo(() => {
    const rows = Array.from(stats.byCourse.entries())
      .map(([id, info]) => ({
        key: id,
        label: id === "none" ? "Sin curso" : courses.find((c) => c.id === id)?.name ?? "Sin curso",
        count: info.count,
        color: info.color,
      }))
      .sort((a, b) => b.count - a.count);
    return rows;
  }, [stats.byCourse, courses]);

  const maxCourse = Math.max(1, ...courseRows.map((r) => r.count));
  const maxWeek = Math.max(1, ...stats.byWeek.map((w) => w.value));

  const summary = [
    { label: "Totales", value: stats.total, className: "text-zinc-100" },
    { label: "Vencidas", value: stats.overdue, className: "text-red-400" },
    { label: "Próximas (≤2 días)", value: stats.dueSoon, className: "text-amber-400" },
    { label: "Progreso", value: `${stats.completion}%`, className: "text-violet-300" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 overflow-y-auto px-4 py-5 sm:px-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-100">Estadísticas</h1>
        <p className="text-sm text-zinc-500">Resumen de tu carga académica</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className={`text-2xl font-bold ${s.className}`}>{s.value}</p>
            <p className="text-xs text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Distribución por estado</h2>
          <div className="mt-4 flex items-center justify-center gap-8">
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 144 144" className="h-full w-full -rotate-90">
                <circle cx="72" cy="72" r="54" fill="none" stroke="#27272a" strokeWidth="18" />
                {(() => {
                  let offset = 0;
                  return (Object.keys(stats.byStatus) as TaskStatus[]).map((status) => {
                    const len = stats.total > 0 ? (stats.byStatus[status] / stats.total) * 2 * Math.PI * 54 : 0;
                    const el = (
                      <circle
                        key={status}
                        cx="72"
                        cy="72"
                        r="54"
                        fill="none"
                        stroke={statusColors[status]}
                        strokeWidth="18"
                        strokeDasharray={`${len} ${2 * Math.PI * 54 - len}`}
                        strokeDashoffset={-offset}
                      />
                    );
                    offset += len;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-zinc-100">{stats.completion}%</span>
                <span className="text-[11px] text-zinc-500">completado</span>
              </div>
            </div>
            <ul className="space-y-2">
              {(Object.keys(stats.byStatus) as TaskStatus[]).map((status) => (
                <li key={status} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[status] }} />
                  <span className={`font-medium ${statusMeta[status].className}`}>{statusMeta[status].label}</span>
                  <span className="ml-auto pl-4 text-zinc-400">{stats.byStatus[status]}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Tareas por curso</h2>
          {courseRows.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600">
              Sin tareas todavía
            </p>
          ) : (
            <div>
              <div className="mt-6 flex h-40 items-end gap-3">
                {courseRows.map((row) => (
                  <div key={row.key} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-medium text-zinc-400">{row.count}</span>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                          height: `${(row.count / maxCourse) * 100}%`,
                          backgroundColor: row.color,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <span
                      className="w-full truncate text-center text-[10px] text-zinc-500"
                      title={row.label}
                    >
                      {row.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Tareas terminadas por semana</h2>
        <div className="mt-6 flex h-40 items-end gap-3">
          {stats.byWeek.map((week) => (
            <div key={week.label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-medium text-zinc-400">{week.value}</span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-violet-500/80 transition-all"
                  style={{ height: `${(week.value / maxWeek) * 100}%` }}
                />
              </div>
              <span className="w-full truncate text-center text-[10px] text-zinc-500">{week.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}