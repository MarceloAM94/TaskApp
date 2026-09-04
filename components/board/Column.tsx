"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableTaskCard from "@/components/tasks/SortableTaskCard";
import type { TaskWithCourse, TaskStatus } from "@/lib/types";

const columnConfig: Record<TaskStatus, { title: string; accent: string }> = {
  pending: { title: "Pendiente", accent: "bg-sky-500" },
  in_progress: { title: "En desarrollo", accent: "bg-amber-500" },
  done: { title: "Terminado", accent: "bg-emerald-500" },
};

interface ColumnProps {
  status: TaskStatus;
  tasks: TaskWithCourse[];
  onTaskClick: (task: TaskWithCourse) => void;
  onAddTask: () => void;
}

export default function Column({
  status,
  tasks,
  onTaskClick,
  onAddTask,
}: ColumnProps) {
  const config = columnConfig[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={`flex w-full shrink-0 flex-col rounded-2xl border bg-zinc-900/60 transition-colors sm:min-h-0 sm:min-w-0 sm:flex-1 ${
        isOver ? "border-violet-500/60 bg-zinc-900" : "border-zinc-800"
      }`}
    >
      <div className="flex shrink-0 items-center gap-2 px-4 py-3">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${config.accent}`} />
        <h2 className="text-sm font-semibold text-zinc-200">{config.title}</h2>
        <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
          {tasks.length}
        </span>
        <button
          onClick={onAddTask}
          title={`Nueva tarea en ${config.title}`}
          aria-label={`Nueva tarea en ${config.title}`}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-700/60 hover:text-zinc-200"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
          </svg>
        </button>
      </div>

      <SortableContext
        id={status}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 sm:min-h-0"
        >
          {tasks.length === 0 ? (
            <button
              onClick={onAddTask}
              className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 p-6 text-center text-zinc-500 transition-colors hover:border-violet-500/40 hover:bg-zinc-900/40 hover:text-zinc-400"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m6-6H6"
                />
              </svg>
              <span className="text-xs">
                Arrastra una tarea aquí o pulsa para crear
              </span>
            </button>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}