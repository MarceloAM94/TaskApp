"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { createTask, type CreateTaskInput } from "@/actions/tasks";
import type { Course, TaskPriority, TaskStatus, TaskWithCourse } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-violet-500";

interface CreateTaskFormProps {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  initialStatus?: TaskStatus;
  onCreated: (task: TaskWithCourse) => void;
}

export default function CreateTaskForm({
  open,
  onClose,
  courses,
  initialStatus = "pending",
  onCreated,
}: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCourseId("");
    setStatus(initialStatus);
    setPriority("medium");
    setDueDate("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const input: CreateTaskInput = {
        title: title.trim(),
        description: description.trim() || null,
        course_id: courseId || null,
        status,
        priority,
        due_date: dueDate || null,
        progress: 0,
      };
      const task = await createTask(input);
      const course = courseId ? courses.find((c) => c.id === courseId) || null : null;
      onCreated({ ...task, courses: course, subtask_count: 0 });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva tarea">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Título *
          </label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Entregar práctica de Java II"
            autoFocus
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
            placeholder="Detalles de la tarea (opcional)"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              Estado
            </label>
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value="pending">Pendiente</option>
              <option value="in_progress">En desarrollo</option>
              <option value="done">Terminado</option>
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
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
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

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear tarea"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
