"use client";

import { useState } from "react";
import Column from "@/components/board/Column";
import CreateTaskForm from "@/components/tasks/CreateTaskForm";
import TaskDetailModal from "@/components/tasks/TaskDetailModal";
import { updateTaskStatus, deleteTask } from "@/actions/tasks";
import type { Course, TaskStatus, TaskWithCourse } from "@/lib/types";

const STATUSES: TaskStatus[] = ["pending", "in_progress", "done"];

interface ClientBoardProps {
  initialTasks: TaskWithCourse[];
  courses: Course[];
}

export default function ClientBoard({
  initialTasks,
  courses,
}: ClientBoardProps) {
  const [tasks, setTasks] = useState<TaskWithCourse[]>(initialTasks);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tasksByStatus = (status: TaskStatus) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);

  const handleAddTask = (newTask: TaskWithCourse) => {
    setTasks((prev) => [...prev, newTask]);
    setShowCreate(false);
  };

  const handleUpdateTask = (updated: TaskWithCourse) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleStatusChange = async (task: TaskWithCourse, status: TaskStatus) => {
    setLoading(true);
    setError(null);
    try {
      const targetCount = tasks.filter(
        (t) => t.status === status && t.id !== task.id
      ).length;
      const updated = await updateTaskStatus(task.id, status, targetCount);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: updated.status,
                position: targetCount,
                completed_at: updated.completed_at,
              }
            : t
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar la tarea");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarea?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTask(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-1">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Mis Tareas</h1>
          <p className="text-sm text-zinc-500">Tablero Kanban universitario</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-900/40 transition-colors hover:bg-violet-500"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m6-6H6"
            />
          </svg>
          Nueva tarea
        </button>
      </header>

      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-start sm:gap-4 sm:overflow-x-auto sm:px-6">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasksByStatus(status)}
            onTaskClick={setSelectedTask}
          />
        ))}
      </div>

      <CreateTaskForm
        open={showCreate}
        onClose={() => setShowCreate(false)}
        courses={courses}
        onCreated={handleAddTask}
      />

      <TaskDetailModal
        key={selectedTask?.id ?? "none"}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        courses={courses}
        onUpdate={handleUpdateTask}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
}
