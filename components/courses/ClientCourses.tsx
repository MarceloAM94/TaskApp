"use client";

import { useState } from "react";
import { createCourse, updateCourse, deleteCourse } from "@/actions/courses";
import type { Course } from "@/lib/types";

const PRESET_COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22d3ee",
  "#34d399",
  "#a3e635",
  "#f43f5e",
  "#38bdf8",
];

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-violet-500";

interface ClientCoursesProps {
  initialCourses: Course[];
}

export default function ClientCourses({ initialCourses }: ClientCoursesProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setSemester("");
    setColor(PRESET_COLORS[0]);
    setEditing(null);
    setError(null);
  };

  const startEdit = (course: Course) => {
    setEditing(course);
    setName(course.name);
    setSemester(course.semester ?? "");
    setColor(course.color);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editing) {
        const updated = await updateCourse(editing.id, {
          name: name.trim(),
          semester: semester.trim() || null,
          color,
        });
        setCourses((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        const created = await createCourse({
          name: name.trim(),
          semester: semester.trim() || null,
          color,
        });
        setCourses((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el curso");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (course: Course) => {
    if (
      !window.confirm(
        `¿Eliminar el curso "${course.name}"? Las tareas sin curso quedarán sin asignar.`
      )
    )
      return;
    setLoading(true);
    setError(null);
    try {
      await deleteCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      if (editing?.id === course.id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Cursos</h1>
        <p className="text-sm text-zinc-500">
          Gestiona los cursos para asociarlos a tus tareas
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
      >
        <h2 className="mb-4 text-sm font-semibold text-zinc-200">
          {editing ? `Editar: ${editing.name}` : "Nuevo curso"}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Nombre *
            </label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Java II"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Semestre
            </label>
            <input
              className={inputClass}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="Ej. 2026-1"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full transition-transform ${
                  color === c ? "scale-110 ring-2 ring-white/70" : ""
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "Guardando..." : editing ? "Guardar cambios" : "Crear curso"}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-600">
            Aún no hay cursos. Crea tu primer curso.
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
            >
              <span
                className="h-8 w-8 shrink-0 rounded-lg"
                style={{ backgroundColor: course.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {course.name}
                </p>
                {course.semester && (
                  <p className="text-xs text-zinc-500">{course.semester}</p>
                )}
              </div>
              <button
                onClick={() => startEdit(course)}
                disabled={loading}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(course)}
                disabled={loading}
                className="rounded-lg px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
