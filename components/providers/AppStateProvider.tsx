"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { TaskWithCourse } from "@/lib/types";

interface AppStateContextValue {
  detailTask: TaskWithCourse | null;
  openDetail: (task: TaskWithCourse) => void;
  closeDetail: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [detailTask, setDetailTask] = useState<TaskWithCourse | null>(null);

  const openDetail = useCallback((task: TaskWithCourse) => {
    setDetailTask(task);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailTask(null);
  }, []);

  return (
    <AppStateContext.Provider value={{ detailTask, openDetail, closeDetail }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (context === null) {
    throw new Error("useAppState debe usarse dentro de <AppStateProvider>");
  }
  return context;
}