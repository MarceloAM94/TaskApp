"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { createTask, type CreateTaskInput } from "@/actions/tasks";
import type { Course, TaskWithCourse } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none";

interface QuickCreateFormProps {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  onCreated: (task: TaskWithCourse) => void;
}

export default function QuickCreateForm({
  open,
  onClose,
  courses,
  onCreated,
}: QuickCreateFormProps) {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    try {
      const input: CreateTaskInput = {
        title: trimmed,
        description: null,
        course_id: courseId || null,
        status: "pending",
        priority: "medium",
        due_date: null,
        progress: 0,
        reminder_offset_hours: null,
      };
      const task = await createTask(input);
      const course = courseId
        ? courses.find((c) => c.id === courseId) || null
        : null;
      onCreated({ ...task, courses: course, subtask_count: 0 });
      setTitle("");
      setCourseId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva tarea rápida"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la tarea…"
          className={inputClass}
        />
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className={inputClass}
        >
          <option value="">Sin curso</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Creando…" : "Crear tarea"}
        </button>
      </form>
    </Modal>
  );
}