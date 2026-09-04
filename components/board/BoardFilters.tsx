"use client";

import type { Course, TaskPriority } from "@/lib/types";

interface BoardFiltersProps {
  courses: Course[];
  courseFilter: string;
  onCourseFilter: (id: string) => void;
  priorityFilter: TaskPriority | "all";
  onPriorityFilter: (p: TaskPriority | "all") => void;
  showDone: boolean;
  onShowDone: (v: boolean) => void;
  taskCount: number;
}

const selectClass =
  "h-8 rounded-lg border border-zinc-700/80 bg-zinc-800/80 px-2.5 pr-7 text-xs text-zinc-200 outline-none transition-colors focus:border-violet-500";

export default function BoardFilters({
  courses,
  courseFilter,
  onCourseFilter,
  priorityFilter,
  onPriorityFilter,
  showDone,
  onShowDone,
  taskCount,
}: BoardFiltersProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-zinc-800/60 px-4 py-2 sm:px-6">
      <select
        className={selectClass}
        value={courseFilter}
        onChange={(e) => onCourseFilter(e.target.value)}
      >
        <option value="all">Todos los cursos</option>
        <option value="none">Sin curso</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={priorityFilter}
        onChange={(e) =>
          onPriorityFilter(e.target.value as TaskPriority | "all")
        }
      >
        <option value="all">Todas las prioridades</option>
        <option value="high">Prioridad alta</option>
        <option value="medium">Prioridad media</option>
        <option value="low">Prioridad baja</option>
      </select>

      <button
        onClick={() => onShowDone(!showDone)}
        role="switch"
        aria-checked={showDone}
        className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
          showDone
            ? "text-violet-300"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <span
          aria-hidden="true"
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
            showDone
              ? "border-violet-500/60 bg-violet-500/30"
              : "border-zinc-600 bg-zinc-800"
          }`}
        >
          <span
            className={`absolute h-3.5 w-3.5 rounded-full shadow transition-all ${
              showDone
                ? "left-[18px] bg-violet-300"
                : "left-1 bg-zinc-500"
            }`}
          />
        </span>
        Terminadas
      </button>

      <span className="ml-auto text-xs text-zinc-500">
        {taskCount} {taskCount === 1 ? "tarea" : "tareas"}
      </span>
    </div>
  );
}