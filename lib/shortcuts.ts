export interface ShortcutItem {
  keys: string;
  label: string;
  scope: string;
}

export const SHORTCUTS: ShortcutItem[] = [
  { keys: "Ctrl/Cmd + K", label: "Abrir o cerrar la búsqueda rápida", scope: "Global" },
  { keys: "N", label: "Nueva tarea rápida (título + curso)", scope: "Tablero" },
  {
    keys: "1 / 2 / 3",
    label: "Mover la tarea abierta a Pendiente, En desarrollo o Terminada",
    scope: "Tablero",
  },
  { keys: "Esc", label: "Cerrar modal o buscador abierto", scope: "Global" },
  { keys: "↑ / ↓", label: "Navegar por los resultados de búsqueda", scope: "Buscador" },
  { keys: "Enter", label: "Abrir la tarea seleccionada en la búsqueda", scope: "Buscador" },
];