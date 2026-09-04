"use client";

import { useEffect, useState } from "react";
import {
  getSubtasks,
  createSubtask,
  toggleSubtask,
  deleteSubtask,
} from "@/actions/subtasks";
import { updateTask } from "@/actions/tasks";
import type { Subtask } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-violet-500";

interface SubtaskListProps {
  taskId: string;
  taskProgress: number;
  onProgressChange: (progress: number) => void;
}

export default function SubtaskList({
  taskId,
  taskProgress,
  onProgressChange,
}: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSubtasks(taskId)
      .then((data) => {
        if (cancelled) return;
        setSubtasks(data);

        // Si la tarea tiene subtareas, el progreso se calcula automáticamente
        if (data.length > 0) {
          const doneCount = data.filter((s) => s.is_done).length;
          const computed = Math.round((doneCount / data.length) * 100);
          if (computed !== taskProgress) {
            onProgressChange(computed);
          }
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar subtareas"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const applyProgress = (next: Subtask[], persist: boolean) => {
    setSubtasks(next);
    if (next.length === 0) return;
    const doneCount = next.filter((s) => s.is_done).length;
    const computed = Math.round((doneCount / next.length) * 100);
    onProgressChange(computed);
    if (persist) {
      updateTask(taskId, { progress: computed }).catch(() => {});
    }
  };

  const handleAdd = async () => {
    if (!description.trim()) return;
    setError(null);
    try {
      const created = await createSubtask({
        task_id: taskId,
        description: description.trim(),
        position: subtasks.length,
      });
      const next = [...subtasks, created];
      setDescription("");
      applyProgress(next, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al agregar subtarea");
    }
  };

  const handleToggle = async (subtask: Subtask) => {
    const next = subtasks.map((s) =>
      s.id === subtask.id ? { ...s, is_done: !s.is_done } : s
    );
    await toggleSubtask(subtask.id, !subtask.is_done).catch(() => {});
    applyProgress(next, true);
  };

  const handleDelete = async (subtaskId: string) => {
    const next = subtasks.filter((s) => s.id !== subtaskId);
    await deleteSubtask(subtaskId).catch(() => {});
    applyProgress(next, true);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400">
          Subtareas {subtasks.length > 0 && `(${subtasks.filter((s) => s.is_done).length}/${subtasks.length})`}
        </label>
      </div>

      {error && (
        <p className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {loading ? (
          <p className="text-xs text-zinc-600">Cargando subtareas...</p>
        ) : subtasks.length === 0 ? (
          <p className="text-xs text-zinc-600">Sin subtareas. Agrega la primera.</p>
        ) : (
          subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="group flex items-center gap-2 rounded-lg bg-zinc-800/60 px-2 py-1.5"
            >
              <button
                onClick={() => handleToggle(subtask)}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  subtask.is_done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-zinc-600 hover:border-zinc-500"
                }`}
                aria-label="Marcar como completada"
              >
                {subtask.is_done && (
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 text-sm ${
                  subtask.is_done ? "text-zinc-500 line-through" : "text-zinc-200"
                }`}
              >
                {subtask.description}
              </span>
              <button
                onClick={() => handleDelete(subtask.id)}
                className="text-zinc-500 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                aria-label="Eliminar subtarea"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nueva subtarea..."
        />
        <button
          onClick={handleAdd}
          disabled={!description.trim()}
          className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}