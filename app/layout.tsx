import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskApp — Control de Tareas Universitarias",
  description: "Tablero Kanban para gestionar tareas académicas (UTP)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <nav className="flex items-center gap-1 border-b border-zinc-800 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="mr-4 flex items-center gap-2 font-bold text-zinc-100"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-sm text-white">
              T
            </span>
            TaskApp
          </Link>
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Tablero
          </Link>
          <Link
            href="/cursos"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Cursos
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
