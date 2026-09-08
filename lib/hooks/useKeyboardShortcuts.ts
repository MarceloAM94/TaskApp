"use client";

import { useEffect } from "react";

export interface ShortcutModifiers {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export interface ShortcutBinding {
  key: string;
  modifiers?: ShortcutModifiers;
  ignoreWhenTyping?: boolean;
  handler: (event: KeyboardEvent) => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts(bindings: ShortcutBinding[]): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      for (const binding of bindings) {
        const {
          key,
          modifiers = {},
          ignoreWhenTyping = true,
          handler,
        } = binding;

        if (event.key !== key && event.key.toLowerCase() !== key) continue;

        const ctrlOrMeta = event.ctrlKey || event.metaKey;
        if (modifiers.ctrl && !ctrlOrMeta) continue;
        if (!modifiers.ctrl && ctrlOrMeta) continue;
        if (modifiers.shift && !event.shiftKey) continue;
        if (modifiers.alt && !event.altKey) continue;

        if (ignoreWhenTyping && isTypingTarget(event.target)) continue;

        handler(event);
        break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bindings]);
}