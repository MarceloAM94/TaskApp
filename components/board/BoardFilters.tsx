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
  "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 outline-none transition-colors focus:border-violet-500";

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
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
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
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          showDone
            ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
            : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200"
        }`}
      >
        Mostrar terminadas
      </button>

      <span className="ml-auto text-xs text-zinc-500">
        {taskCount} {taskCount === 1 ? "tarea" : "tareas"}
      </span>
    </div>
  );
}