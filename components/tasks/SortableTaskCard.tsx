"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "@/components/tasks/TaskCard";
import type { TaskWithCourse } from "@/lib/types";

interface SortableTaskCardProps {
  task: TaskWithCourse;
  onClick: () => void;
}

export default function SortableTaskCard({
  task,
  onClick,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none ${isDragging ? "relative z-10 cursor-grabbing" : "cursor-grab"}`}
    >
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}