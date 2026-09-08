"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { SHORTCUTS } from "@/lib/shortcuts";

export default function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ver atajos de teclado"
        title="Atajos de teclado"
        className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        ?
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Atajos de teclado" maxWidth="max-w-md">
        <ul className="flex flex-col gap-3">
          {SHORTCUTS.map((shortcut) => (
            <li
              key={shortcut.keys}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium text-zinc-100">{shortcut.label}</p>
                <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                  {shortcut.scope}
                </p>
              </div>
              <kbd className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs font-mono text-violet-300">
                {shortcut.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}