"use client";

import { useMemo, useState } from "react";
import { DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Column from "@/components/board/Column";
import BoardFilters from "@/components/board/BoardFilters";
import TaskCard from "@/components/tasks/TaskCard";
import CreateTaskForm from "@/components/tasks/CreateTaskForm";
import TaskDetailModal from "@/components/tasks/TaskDetailModal";
import { updateTaskStatus, updateTaskPositions, deleteTask } from "@/actions/tasks";
import type { Course, TaskStatus, TaskWithCourse, TaskPriority } from "@/lib/types";

const STATUSES: TaskStatus[] = ["pending", "in_progress", "done"];

interface ClientBoardProps {
  initialTasks: TaskWithCourse[];
  courses: Course[];
}

function findContainer(
  id: string,
  tasksByStatus: Record<string, TaskWithCourse[]>
): TaskStatus {
  for (const status of STATUSES) {
    if (tasksByStatus[status].some((t) => t.id === id)) return status;
  }
  return id as TaskStatus; // si no es tarea, es el id del contenedor (un status)
}

export default function ClientBoard({
  initialTasks,
  courses,
}: ClientBoardProps) {
  const [tasks, setTasks] = useState<TaskWithCourse[]>(initialTasks);
  const [showCreate, setShowCreate] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("pending");
  const [selectedTask, setSelectedTask] = useState<TaskWithCourse | null>(null);
  const [activeTask, setActiveTask] = useState<TaskWithCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [courseFilter, setCourseFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [showDone, setShowDone] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const tasksByStatus = useMemo(
    () =>
      STATUSES.reduce(
        (acc, status) => {
          acc[status] = tasks
            .filter((t) => t.status === status)
            .sort((a, b) => a.position - b.position);
          return acc;
        },
        {} as Record<TaskStatus, TaskWithCourse[]>
      ),
    [tasks]
  );

  const displayByStatus = useMemo(
    () =>
      STATUSES.reduce(
        (acc, status) => {
          acc[status] = tasksByStatus[status].filter((t) => {
            if (!showDone && t.status === "done") return false;
            if (courseFilter === "none" && t.course_id !== null) return false;
            if (
              courseFilter !== "all" &&
              courseFilter !== "none" &&
              t.course_id !== courseFilter
            )
              return false;
            if (priorityFilter !== "all" && t.priority !== priorityFilter)
              return false;
            return true;
          });
          return acc;
        },
        {} as Record<TaskStatus, TaskWithCourse[]>
      ),
    [tasksByStatus, courseFilter, priorityFilter, showDone]
  );

  const visibleCount = useMemo(
    () => STATUSES.reduce((sum, s) => sum + displayByStatus[s].length, 0),
    [displayByStatus]
  );

  const openCreate = (status: TaskStatus = "pending") => {
    setCreateStatus(status);
    setShowCreate(true);
  };

  const handleAddTask = (newTask: TaskWithCourse) => {
    setTasks((prev) => [...prev, newTask]);
    setShowCreate(false);
  };

  const handleUpdateTask = (updated: TaskWithCourse) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleStatusChange = async (
    task: TaskWithCourse,
    status: TaskStatus
  ) => {
    setError(null);
    try {
      const destination = tasks.filter(
        (t) => t.status === status && t.id !== task.id
      );
      const targetCount = destination.length;
      await updateTaskStatus(task.id, status, targetCount);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status, position: targetCount }
            : t
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar la tarea");
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

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeContainer = findContainer(activeId, tasksByStatus);
    const overContainer = findContainer(overId, tasksByStatus);
    if (activeContainer === overContainer) return;

    setTasks((prev) => {
      const source = prev
        .filter((t) => t.status === activeContainer)
        .sort((a, b) => a.position - b.position);
      const destination = prev
        .filter((t) => t.status === overContainer)
        .sort((a, b) => a.position - b.position);

      const item = source.find((t) => t.id === activeId)!;
      let newIndex = destination.length;
      if (overContainer === overId) {
        // sobre la columna vacía o el contenedor → al final
      } else {
        const overTaskIndex = destination.findIndex((t) => t.id === overId);
        if (overTaskIndex !== -1) {
          const isBelowOverItem =
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height / 2;
          newIndex = isBelowOverItem ? overTaskIndex + 1 : overTaskIndex;
        }
      }

      const nextSource = source.filter((t) => t.id !== activeId);
      const nextDestination = [...destination];
      nextDestination.splice(newIndex, 0, { ...item, status: overContainer as TaskStatus });

      const updated = prev.map((t) => {
        const idxInSource = nextSource.findIndex((x) => x.id === t.id);
        if (idxInSource !== -1) return { ...t, position: idxInSource };
        const idxInDest = nextDestination.findIndex((x) => x.id === t.id);
        if (idxInDest !== -1) {
          return {
            ...t,
            ...(t.id === item.id
              ? { status: overContainer as TaskStatus, position: idxInDest }
              : { position: idxInDest }),
          };
        }
        return t;
      });

      return updated;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeContainer = findContainer(activeId, tasksByStatus);
    const overContainer = findContainer(overId, tasksByStatus);

    // Reordenar dentro de la misma columna
    if (activeContainer === overContainer) {
      const col = tasksByStatus[activeContainer];
      const oldIndex = col.findIndex((t) => t.id === activeId);
      const newIndex = col.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const reordered = arrayMove(col, oldIndex, newIndex).map((t, i) => ({
        ...t,
        position: i,
      }));

      setTasks((prev) => {
        const others = prev.filter((t) => t.status !== activeContainer);
        return [...others, ...reordered];
      });

      persistPositions(reordered.map((t) => ({ id: t.id, status: t.status, position: t.position })));
      return;
    }

    // Mover entre columnas
    setTasks((prev) => {
      const source = prev
        .filter((t) => t.status === activeContainer)
        .sort((a, b) => a.position - b.position);
      const destination = prev
        .filter((t) => t.status === overContainer)
        .sort((a, b) => a.position - b.position);

      const item = source.find((t) => t.id === activeId)!;
      let newIndex = destination.length;
      const overTask = destination.find((t) => t.id === overId);
      if (overTask) {
        const overIndex = destination.indexOf(overTask);
        const isBelow =
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height / 2;
        newIndex = isBelow ? overIndex + 1 : overIndex;
      }

      const nextSource = source.filter((t) => t.id !== activeId);
      const nextDestination = [...destination];
      nextDestination.splice(newIndex, 0, {
        ...item,
        status: overContainer as TaskStatus,
        position: newIndex,
      });

      const toPersist: { id: string; status: TaskStatus; position: number }[] = [];
      const updated = prev.map((t) => {
        const srcIdx = nextSource.findIndex((x) => x.id === t.id);
        if (srcIdx !== -1) {
          toPersist.push({ id: t.id, status: activeContainer as TaskStatus, position: srcIdx });
          return { ...t, position: srcIdx };
        }
        const destIdx = nextDestination.findIndex((x) => x.id === t.id);
        if (destIdx !== -1) {
          toPersist.push({
            id: t.id,
            status: overContainer as TaskStatus,
            position: destIdx,
          });
          return { ...t, status: overContainer as TaskStatus, position: destIdx };
        }
        return t;
      });

      persistPositions(toPersist);
      return updated;
    });
  };

  const persistPositions = async (
    updates: { id: string; status: TaskStatus; position: number }[]
  ) => {
    setError(null);
    try {
      await updateTaskPositions(updates);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar el orden");
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Mis Tareas</h1>
          <p className="text-sm text-zinc-500">Tablero Kanban universitario</p>
        </div>
        <button
          onClick={() => openCreate("pending")}
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
        <div className="mx-4 mb-2 shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col sm:min-h-0">
          <BoardFilters
            courses={courses}
            courseFilter={courseFilter}
            onCourseFilter={setCourseFilter}
            priorityFilter={priorityFilter}
            onPriorityFilter={setPriorityFilter}
            showDone={showDone}
            onShowDone={setShowDone}
            taskCount={visibleCount}
          />

          <div className="flex w-full flex-col gap-4 px-4 pb-4 sm:min-h-0 sm:flex-1 sm:flex-row sm:items-stretch sm:gap-4 sm:px-6">
            {STATUSES.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={displayByStatus[status]}
                onTaskClick={setSelectedTask}
                onAddTask={() => openCreate(status)}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-80">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskForm
        key={createStatus}
        open={showCreate}
        onClose={() => setShowCreate(false)}
        courses={courses}
        initialStatus={createStatus}
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