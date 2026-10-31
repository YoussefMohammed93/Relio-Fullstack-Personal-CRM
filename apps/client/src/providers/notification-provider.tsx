import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export type NotificationVariant = "default" | "success" | "error" | "info";

export interface Notification {
  id: string;
  title: string;
  description?: string;
  variant?: NotificationVariant;
}

interface NotificationContextValue {
  notifications: Notification[];
  notify: (notification: Omit<Notification, "id">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: PropsWithChildren) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((notification: Omit<Notification, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setNotifications((current) => [
      ...current,
      {
        id,
        title: notification.title,
        description: notification.description,
        variant: notification.variant ?? "default",
      },
    ]);

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({ notifications, notify, dismiss, dismissAll }),
    [notifications, notify, dismiss, dismissAll],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4"
      >
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="pointer-events-auto w-full max-w-md rounded-md border border-border bg-background/95 p-3 shadow-lg backdrop-blur-sm"
            data-variant={notification.variant}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {notification.title}
                </p>
                {notification.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                aria-label={`Dismiss ${notification.title}`}
                onClick={() => dismiss(notification.id)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }

  return context;
}
