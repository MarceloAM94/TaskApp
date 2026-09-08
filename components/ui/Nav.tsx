"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import KeyboardShortcutsHelp from "@/components/ui/KeyboardShortcutsHelp";

const links = [
  { href: "/", label: "Tablero" },
  { href: "/calendario", label: "Calendario" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/cursos", label: "Cursos" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeDrawer = () => setOpen(false);

  return (
    <>
      <nav className="flex shrink-0 items-center gap-1 border-b border-zinc-800 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="mr-4 flex shrink-0 items-center gap-2 font-bold text-zinc-100"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-sm text-white">
            T
          </span>
          TaskApp
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-violet-500/15 text-violet-300"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <KeyboardShortcutsHelp />

        <button
          onClick={() => setOpen(true)}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-zinc-800 sm:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 sm:hidden"
          onClick={closeDrawer}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 flex h-dvh w-64 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-300 sm:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
          <Link
            href="/"
            onClick={closeDrawer}
            className="flex items-center gap-2 font-bold text-zinc-100"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-sm text-white">
              T
            </span>
            TaskApp
          </Link>
          <button
            onClick={closeDrawer}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Cerrar menú"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeDrawer}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-violet-500/15 text-violet-300"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500">
          TaskApp
        </div>
      </aside>
    </>
  );
}