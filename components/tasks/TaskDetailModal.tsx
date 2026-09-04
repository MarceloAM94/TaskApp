"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import SubtaskList from "@/components/tasks/SubtaskList";
import { updateTask } from "@/actions/tasks";
import type { Course, TaskPriority, TaskStatus, TaskWithCourse } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-violet-500";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En desarrollo" },
  { value: "done", label: "Terminado" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

interface TaskDetailModalProps {
  task: TaskWithCourse | null;
  onClose: () => void;
  courses: Course[];
  onUpdate: (task: TaskWithCourse) => void;
  onStatusChange: (task: TaskWithCourse, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  loading: boolean;
}

export default function TaskDetailModal({
  task,
  onClose,
  courses,
  onUpdate,
  onStatusChange,
  onDelete,
  loading,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [courseId, setCourseId] = useState(task?.course_id ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [progress, setProgress] = useState(task?.progress ?? 0);
  const [error, setError] = useState<string | null>(null);

  // Usa una clave (key) externa para remontar el componente con estado inicial
  // limpio cuando cambia la tarea seleccionada. Si no hay tarea, renderiza el
  // Modal vacío con manejo de nulos.
  if (!task) {
    return (
      <Modal open={false} onClose={onClose} title="Detalle de tarea">
        <div />
      </Modal>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    setError(null);
    try {
      const updated = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        course_id: courseId || null,
        priority,
        due_date: dueDate || null,
        progress: Math.max(0, Math.min(100, progress)),
      });
      const course = courseId ? courses.find((c) => c.id === courseId) || null : null;
      onUpdate({ ...task, ...updated, courses: course, subtask_count: task.subtask_count });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  const handleStatusSelect = async (status: TaskStatus) => {
    if (status === task.status) return;
    await onStatusChange(task, status);
    const course = task.courses;
    onUpdate({ ...task, status, course_id: task.course_id, courses: course });
  };

  return (
    <Modal open={!!task} onClose={onClose} title="Detalle de tarea">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Título *
          </label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Descripción
          </label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Curso
            </label>
            <select
              className={inputClass}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Sin curso</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Prioridad
            </label>
            <select
              className={inputClass}
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Fecha límite
            </label>
            <input
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Progreso: {progress}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        <SubtaskList
          taskId={task.id}
          taskProgress={task.progress}
          onProgressChange={setProgress}
        />

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Estado
          </label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => handleStatusSelect(o.value)}
                disabled={loading}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  task.status === o.value
                    ? o.value === "done"
                      ? "bg-emerald-600 text-white"
                      : o.value === "in_progress"
                        ? "bg-amber-600 text-white"
                        : "bg-sky-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={() => onDelete(task.id)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Eliminar
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
