export type TaskStatus = "pending" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Course {
  id: string;
  name: string;
  semester: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  progress: number;
  position: number;
  created_at: string;
  completed_at: string | null;
}

export interface Subtask {
  id: string;
  task_id: string;
  description: string;
  is_done: boolean;
  position: number;
}

export interface TaskWithCourse extends Task {
  courses: Course | null;
  subtask_count: number;
}

export interface TaskWithSubtasks extends TaskWithCourse {
  subtasks: Subtask[];
}
