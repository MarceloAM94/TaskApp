import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/ui/Nav";
import ReminderChecker from "@/components/notifications/ReminderChecker";
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
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 sm:h-dvh">
        <Nav />
        {children}
        <ReminderChecker />
      </body>
    </html>
  );
}
