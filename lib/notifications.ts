const isSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isSupported()) return "denied";
  return Notification.requestPermission();
}

export function notificationsEnabled(): boolean {
  return isSupported() && Notification.permission === "granted";
}

export function showNotification(title: string, body?: string): void {
  if (!isSupported()) return;

  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body: body ?? "",
        icon: "/icon.png",
        tag: title,
      });
    } catch {
      // Algunos navegadores (p. ej. Safari legacy) requieren service worker.
    }
  }
}