"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import KeyboardShortcutsHelp from "@/components/ui/KeyboardShortcutsHelp";

const links = [
  { href: "/", label: "Tablero" },
  { href: "/calendario", label: "Calendario" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/cursos", label: "Cursos" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center gap-1 border-b border-zinc-800 px-4 py-3 sm:px-6">
      <Link
        href="/"
        className="mr-4 flex items-center gap-2 font-bold text-zinc-100"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-sm text-white">
          T
        </span>
        TaskApp
      </Link>

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

        <KeyboardShortcutsHelp />
      </nav>
  );
}