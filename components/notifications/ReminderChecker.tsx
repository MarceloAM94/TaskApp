"use client";

import { useEffect, useRef, useState } from "react";
import { getDueReminders, markRemindersSent } from "@/actions/reminders";
import {
  requestNotificationPermission,
  showNotification,
} from "@/lib/notifications";

const CHECK_INTERVAL_MS = 60_000;

export default function ReminderChecker() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "denied";
  });
  const [showBanner, setShowBanner] = useState(true);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (permission !== "granted") return;

    let cancelled = false;

    const check = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;
      try {
        const due = await getDueReminders();
        if (cancelled || due.length === 0) return;

        for (const reminder of due) {
          showNotification("Tarea por vencer", reminder.title);
        }
        await markRemindersSent(due.map((d) => d.id));
      } catch {
        // Silencioso: reintenta en el próximo tick.
      } finally {
        checkingRef.current = false;
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [permission]);

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  if (permission !== "default" || !showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex max-w-xs items-start gap-3 rounded-2xl border border-zinc-700 bg-zinc-800 p-4 shadow-xl shadow-black/40">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-zinc-100">Recordatorios de vencimiento</p>
        <p className="text-xs text-zinc-400">
          Activa las notificaciones del navegador para avisarte cuando una tarea esté por vencer.
        </p>
        <div className="mt-1 flex items-center gap-2">
          <button
            onClick={handleEnable}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-500"
          >
            Activar recordatorios
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="rounded-lg px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}