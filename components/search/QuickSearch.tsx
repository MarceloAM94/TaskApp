"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getTasks } from "@/actions/tasks";
import { useAppState } from "@/components/providers/AppStateProvider";
import Badge from "@/components/ui/Badge";
import type { TaskStatus, TaskWithCourse } from "@/lib/types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En desarrollo",
  done: "Terminada",
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
};

export default function QuickSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const { openDetail } = useAppState();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [allTasks, setAllTasks] = useState<TaskWithCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const tasks = await getTasks();
      setAllTasks(tasks);
    } finally {
      setLoading(false);
    }
  };

  const results = useMemo(() => {
    const haystack = normalize(query.trim());
    if (haystack === "") return [];

    const filtered = allTasks.filter((task) =>
      normalize(task.title).includes(haystack)
    );
    return filtered
      .sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        return 0;
      })
      .slice(0, 10);
  }, [allTasks, query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (isTypingTarget(event.target)) return;
        const nextOpen = !open;
        setOpen(nextOpen);
        if (nextOpen) {
          setQuery("");
          setSelectedIndex(0);
          void loadTasks();
        }
      }

      if (!open || isTypingTarget(event.target)) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((i) =>
          results.length === 0 ? 0 : (i + 1) % results.length
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((i) =>
          results.length === 0
            ? 0
            : (i - 1 + results.length) % results.length
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          openDetail(selected);
          setOpen(false);
          if (pathname !== "/") router.push("/");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pathname, results, selectedIndex]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 backdrop-blur-sm sm:pt-[12vh]">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4">
          <svg
            className="h-4 w-4 shrink-0 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar tareas… (Ctrl+K para abrir/cerrar)"
            className="h-12 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {loading ? (
            <p className="p-3 text-sm text-zinc-500">Cargando tareas…</p>
          ) : query.trim() === "" ? (
            <p className="p-3 text-sm text-zinc-500">
              Escribe para buscar por título. Usa ↑ ↓ para navegar y Enter para
              abrir.
            </p>
          ) : results.length === 0 ? (
            <p className="p-3 text-sm text-zinc-500">
              Sin resultados para «{query.trim()}».
            </p>
          ) : (
            <ul>
              {results.map((task, index) => (
                <li key={task.id}>
                  <button
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      openDetail(task);
                      setOpen(false);
                      if (pathname !== "/") router.push("/");
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-violet-600/20"
                        : "hover:bg-zinc-800"
                    }`}
                  >
                    {task.courses && (
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: task.courses.color }}
                      />
                    )}
                    <span className="flex-1 truncate text-sm text-zinc-100">
                      {task.title}
                    </span>
                    <Badge
                      className={
                        task.status === "done"
                          ? "bg-zinc-700/40 text-zinc-500"
                          : "bg-zinc-700/50 text-zinc-300"
                      }
                    >
                      {STATUS_LABELS[task.status]}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}