"use client";

import { useEffect, useRef, useState } from "react";
import {
  completeSession,
  getActiveSession,
  startSession,
} from "@/actions/pomodoro";
import {
  FOCUS_SECONDS,
  SHORT_BREAK_SECONDS,
  LONG_BREAK_SECONDS,
  phaseDuration,
  breakAfterFocus,
  type PomodoroPhase,
} from "@/lib/pomodoro-config";
import { showNotification } from "@/lib/notifications";
import { formatClock, formatDuration } from "@/lib/format";

interface PomodoroTimerProps {
  taskId: string;
  onTimeSpentChange: (deltaSeconds: number) => void;
}

interface SessionStart {
  id: string;
  startedAt: number;
}

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  focus: "Pomodoro",
  short_break: "Descanso corto",
  long_break: "Descanso largo",
};

export default function PomodoroTimer({
  taskId,
  onTimeSpentChange,
}: PomodoroTimerProps) {
  const [phase, setPhase] = useState<PomodoroPhase>("focus");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(FOCUS_SECONDS);
  const [completedFocus, setCompletedFocus] = useState(0);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<SessionStart | null>(null);
  const elapsedRef = useRef(0);
  const finishingRef = useRef(false);
  const initRef = useRef(false);

  const setActiveSession = (session: SessionStart | null) => {
    sessionRef.current = session;
    setHasSession(session !== null);
  };

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    let cancelled = false;

    const runInitializer = async () => {
      try {
        const active = await getActiveSession(taskId);
        if (cancelled) return;

        if (active === null) {
          setReady(true);
          return;
        }

        const now = Date.now();
        const elapsedSeconds = Math.floor(
          (now - new Date(active.started_at).getTime()) / 1000
        );

        if (active.type === "focus") {
          if (elapsedSeconds < FOCUS_SECONDS) {
            setActiveSession({ id: active.id, startedAt: now });
            setPhase("focus");
            setRemaining(FOCUS_SECONDS - elapsedSeconds);
            setRunning(true);
            setReady(true);
            return;
          }

          await completeSession(active.id, FOCUS_SECONDS, true);
          onTimeSpentChange(FOCUS_SECONDS);
          const nextPhase = breakAfterFocus(1);
          setCompletedFocus(1);
          setPhase(nextPhase);
          const next = await startSession(taskId, nextPhase);
          setActiveSession({ id: next.id, startedAt: Date.now() });
          setRemaining(phaseDuration(nextPhase));
          setRunning(true);
        } else {
          const duration =
            active.type === "short_break"
              ? SHORT_BREAK_SECONDS
              : LONG_BREAK_SECONDS;
          if (elapsedSeconds < duration) {
            setActiveSession({ id: active.id, startedAt: now });
            setPhase(active.type);
            setRemaining(duration - elapsedSeconds);
            setRunning(true);
            setReady(true);
            return;
          }
          await completeSession(active.id, duration, false);
        }
      } catch {
        // Ignora errores de reanudación: arranca en estado por defecto.
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    runInitializer();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const handlePhaseDone = async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setRunning(false);
    try {
      if (phase === "focus") {
        const session = sessionRef.current;
        if (session) {
          await completeSession(session.id, FOCUS_SECONDS, true);
          onTimeSpentChange(FOCUS_SECONDS);
        }
        const cycle = completedFocus + 1;
        setCompletedFocus(cycle);
        showNotification(
          "Pomodoro completado",
          "Sesión de foco terminada. ¡Buen trabajo!"
        );
        const nextPhase = breakAfterFocus(cycle);
        setPhase(nextPhase);
        const next = await startSession(taskId, nextPhase);
        setActiveSession({ id: next.id, startedAt: Date.now() });
        elapsedRef.current = 0;
        setRemaining(phaseDuration(nextPhase));
        setRunning(true);
      } else {
        const session = sessionRef.current;
        if (session) {
          await completeSession(session.id, phaseDuration(phase), false);
        }
        showNotification("Descanso terminado", "Toca volver a concentrarse.");
        setActiveSession(null);
        setPhase("focus");
        setRemaining(FOCUS_SECONDS);
      }
    } catch {
      setError("No se pudo guardar la sesión.");
      setRunning(false);
    } finally {
      finishingRef.current = false;
    }
  };

  useEffect(() => {
    if (!running || remaining > 0) return;
    const timeout = setTimeout(() => {
      void handlePhaseDone();
    }, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running]);

  const handleStart = async () => {
    if (running || sessionRef.current) return;
    setError(null);
    try {
      const session = await startSession(taskId, "focus");
      setActiveSession({ id: session.id, startedAt: Date.now() });
      elapsedRef.current = 0;
      setPhase("focus");
      setRemaining(FOCUS_SECONDS);
      setRunning(true);
    } catch {
      setError("No se pudo iniciar el Pomodoro.");
    }
  };

  const handlePause = () => {
    if (!running) return;
    const session = sessionRef.current;
    if (session) {
      elapsedRef.current += Date.now() - session.startedAt;
      sessionRef.current = { ...session, startedAt: Date.now() };
    }
    setRunning(false);
  };

  const handleResume = () => {
    const session = sessionRef.current;
    if (session) {
      sessionRef.current = { ...session, startedAt: Date.now() };
    }
    setRunning(true);
  };

  const stopSession = async (durationSeconds: number) => {
    const session = sessionRef.current;
    finishingRef.current = true;
    setRunning(false);
    if (session) {
      try {
        await completeSession(session.id, durationSeconds, false);
      } catch {
        // Ninguna acción adicional.
      }
    }
    setActiveSession(null);
    elapsedRef.current = 0;
    setPhase("focus");
    setRemaining(FOCUS_SECONDS);
    finishingRef.current = false;
  };

  const handleCancel = () => {
    if (!sessionRef.current || finishingRef.current) return;
    const session = sessionRef.current;
    const elapsed = Math.max(
      1,
      Math.floor((elapsedRef.current + Date.now() - session.startedAt) / 1000)
    );
    void stopSession(elapsed);
  };

  const handleSkip = () => {
    if (phase === "focus" || !sessionRef.current || finishingRef.current) return;
    void stopSession(0);
  };

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {PHASE_LABELS[phase]}
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-violet-300">
            {formatClock(remaining)}
          </p>
          {completedFocus > 0 && (
            <p className="mt-0.5 text-[11px] text-zinc-500">
              {completedFocus} foco(s) completado(s) hoy
            </p>
          )}
        </div>
        <span className="inline-flex h-2 w-2 rounded-full bg-zinc-600">
          <span
            className={
              running
                ? "h-2 w-2 animate-pulse rounded-full bg-violet-400"
                : "hidden"
            }
          />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!running && phase === "focus" && (
          <button
            onClick={handleStart}
            disabled={!ready}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
          >
            Iniciar Pomodoro
          </button>
        )}
        {running && (
          <button
            onClick={handlePause}
            className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-600"
          >
            Pausar
          </button>
        )}
        {!running && hasSession && phase === "focus" && (
          <button
            onClick={handleResume}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Reanudar
          </button>
        )}
        {phase !== "focus" && (
          <button
            onClick={handleSkip}
            disabled={!running}
            className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-600 disabled:opacity-50"
          >
            Saltar
          </button>
        )}
        {hasSession && (
          <button
            onClick={handleCancel}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Cancelar
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {!ready && (
        <p className="mt-2 text-xs text-zinc-500">Reanudando sesión…</p>
      )}
      {phase === "focus" && !hasSession && ready && (
        <p className="mt-2 text-xs text-zinc-500">
          Registra tu tiempo de foco: cada sesión completa suma{" "}
          {formatDuration(FOCUS_SECONDS)} a la tarea.
        </p>
      )}
    </div>
  );
}