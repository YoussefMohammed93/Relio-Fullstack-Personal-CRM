import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Handshake,
  LayoutDashboard,
  ListTodo,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useNotifications } from "@/providers/notification-provider";

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", to: "/", icon: LayoutDashboard },
      { label: "Contacts", to: "/contacts", icon: UsersRound },
      { label: "Companies", to: "/companies", icon: Building2 },
      { label: "Deals", to: "/deals", icon: Handshake },
      { label: "Tasks", to: "/tasks", icon: ListTodo },
      { label: "Calendar", to: "/calendar", icon: CalendarDays },
      { label: "Activities", to: "/activities", icon: Activity },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Notifications", to: "/notifications", icon: Bell },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

const pageTitles = new Map(
  navigationGroups.flatMap(({ items }) => items.map(({ label, to }) => [to, label])),
);

export function AppShell() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { notify } = useNotifications();
  const pageTitle =
    pageTitles.get(location.pathname) ??
    [...pageTitles.entries()].find(
      ([path]) => path !== "/" && location.pathname.startsWith(`${path}/`),
    )?.[1] ??
    "Workspace";

  useEffect(() => {
    if (!isMobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMobileOpen]);

  const closeMobileNavigation = () => setIsMobileOpen(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
          onClick={closeMobileNavigation}
        />
      ) : null}

      <aside
        aria-label="Application sidebar"
        className={`fixed inset-y-0 inset-s-0 z-50 flex w-64 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,transform] duration-200 md:relative md:z-auto md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "md:w-19" : "md:w-64"}`}
      >
        <div
          className={`flex h-16 shrink-0 items-center justify-between gap-3 px-4 ${
            isCollapsed ? "md:justify-center md:gap-0 md:px-0" : ""
          }`}
        >
          <NavLink
            to="/"
            aria-label="Relio overview"
            onClick={closeMobileNavigation}
            className={`flex min-w-0 flex-1 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
              isCollapsed ? "md:hidden" : ""
            }`}
          >
            <img
              src="/logo-text.svg"
              alt=""
              className="brand-wordmark-light h-auto w-44 max-w-full"
            />
            <img
              src="/logo-text-dark.svg"
              alt=""
              className="brand-wordmark-dark h-auto w-44 max-w-full"
            />
          </NavLink>
          <button
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring md:grid"
            onClick={() => setIsCollapsed((current) => !current)}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
          <button
            type="button"
            aria-label="Close navigation"
            className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring md:hidden"
            onClick={closeMobileNavigation}
          >
            <X className="size-4" />
          </button>
        </div>

        <nav
          aria-label="Primary navigation"
          className="flex-1 overflow-y-auto px-3 py-4"
        >
          {navigationGroups.map((group) => (
            <div key={group.label} className="mb-6 last:mb-0">
              <p
                className={`mb-2 px-3 text-[11px] font-semibold uppercase text-muted-foreground ${
                  isCollapsed ? "md:sr-only" : ""
                }`}
              >
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map(({ label, to, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === "/"}
                      title={isCollapsed ? label : undefined}
                      onClick={closeMobileNavigation}
                      className={({ isActive }) =>
                        `flex min-h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
                          isActive
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                        } ${isCollapsed ? "md:justify-center md:px-0" : ""}`
                      }
                    >
                      <Icon aria-hidden="true" className="size-4.5 shrink-0" />
                      <span className={isCollapsed ? "md:sr-only" : ""}>{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div
          className={`shrink-0 border-t border-sidebar-border p-4 ${isCollapsed ? "md:hidden" : ""}`}
        >
          <p className="mb-3 px-1 text-xs font-medium text-muted-foreground">
            Appearance
          </p>
          <ThemeSwitcher />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={isMobileOpen}
              className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="size-4.5" />
            </button>
            <div className="hidden min-w-0 sm:block">
              <Breadcrumbs current={pageTitle} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Global search"
              title="Global search"
              icon={<Search />}
              className="px-2.5 sm:min-w-40 sm:justify-between sm:px-3"
              onClick={() =>
                notify({
                  title: "Global search is not available yet.",
                  variant: "info",
                })
              }
            >
              <span className="hidden sm:inline">Search</span>
              <kbd className="ml-4 hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
                Ctrl K
              </kbd>
            </Button>
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>
            <NavLink
              to="/notifications"
              aria-label="Notifications"
              title="Notifications"
              className={({ isActive }) =>
                `grid size-9 place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`
              }
            >
              <Bell aria-hidden="true" className="size-4.5" />
            </NavLink>
            <button
              type="button"
              aria-label="Profile menu"
              title="Profile menu"
              className="flex size-9 items-center justify-center gap-2 rounded-md text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-auto lg:px-2"
              onClick={() =>
                notify({
                  title: "Profile access will be available with account setup.",
                  variant: "info",
                })
              }
            >
              <span className="grid size-7 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <UserRound aria-hidden="true" className="size-4" />
              </span>
              <span className="hidden text-sm font-medium lg:inline">Workspace</span>
              <ChevronDown
                aria-hidden="true"
                className="hidden size-4 text-muted-foreground lg:block"
              />
            </button>
          </div>
        </header>

        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-screen-2xl">
            <PageHeader title={pageTitle} description="Your freelance workspace" />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
