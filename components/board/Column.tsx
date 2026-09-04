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
}

export default function Column({ status, tasks, onTaskClick }: ColumnProps) {
  const config = columnConfig[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={`flex w-full shrink-0 flex-col rounded-2xl border bg-zinc-900/60 transition-colors sm:w-80 ${
        isOver ? "border-violet-500/60 bg-zinc-900" : "border-zinc-800"
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <span className={`h-2.5 w-2.5 rounded-full ${config.accent}`} />
        <h2 className="text-sm font-semibold text-zinc-200">{config.title}</h2>
        <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        id={status}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex min-h-[200px] flex-1 flex-col gap-2 overflow-y-auto p-2"
        >
          {tasks.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600">
              Sin tareas
            </div>
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