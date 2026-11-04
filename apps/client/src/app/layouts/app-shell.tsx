import { useEffect, useRef, useState } from "react";
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
  LogOut,
  UsersRound,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/avatar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/button";
import { DropdownMenu } from "@/components/dropdown-menu";
import { PageHeader } from "@/components/page-header";
import type { MenuEntry } from "@/components/menu-list";
import { useAuth } from "@/features/auth/auth-state";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useNotifications } from "@/providers/notification-provider";

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", to: "/app", icon: LayoutDashboard },
      { label: "Contacts", to: "/app/contacts", icon: UsersRound },
      { label: "Companies", to: "/app/companies", icon: Building2 },
      { label: "Deals", to: "/app/deals", icon: Handshake },
      { label: "Tasks", to: "/app/tasks", icon: ListTodo },
      { label: "Calendar", to: "/app/calendar", icon: CalendarDays },
      { label: "Activities", to: "/app/activities", icon: Activity },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Notifications", to: "/app/notifications", icon: Bell },
      { label: "Settings", to: "/app/settings", icon: Settings },
    ],
  },
];

const pageTitles = new Map(
  navigationGroups.flatMap(({ items }) => items.map(({ label, to }) => [to, label])),
);

export function AppShell() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileNavigationRef = useRef<HTMLElement>(null);
  const mobileNavigationTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationCloseRef = useRef<HTMLButtonElement>(null);
  const wasMobileOpen = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { user, logout } = useAuth();
  const isContactsRoute =
    location.pathname === "/app/contacts" ||
    location.pathname.startsWith("/app/contacts/");
  const isCompaniesRoute =
    location.pathname === "/app/companies" ||
    location.pathname.startsWith("/app/companies/");
  const isDealsRoute =
    location.pathname === "/app/deals" || location.pathname.startsWith("/app/deals/");
  const pageTitle =
    pageTitles.get(location.pathname) ??
    [...pageTitles.entries()]
      .sort(([left], [right]) => right.length - left.length)
      .find(
        ([path]) => path !== "/" && location.pathname.startsWith(`${path}/`),
      )?.[1] ??
    "Workspace";

  useEffect(() => {
    if (!isMobileOpen) {
      if (
        wasMobileOpen.current &&
        mobileNavigationTriggerRef.current?.getClientRects().length
      ) {
        mobileNavigationTriggerRef.current.focus();
      }
      wasMobileOpen.current = false;
      return;
    }

    wasMobileOpen.current = true;
    mobileNavigationCloseRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMobileOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        mobileNavigationRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

      if (!mobileNavigationRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  const closeMobileNavigation = () => setIsMobileOpen(false);
  const profileName = user?.displayName || user?.username || "Your account";
  const profileMenuItems: MenuEntry[] = [
    { type: "label", label: user?.email ?? "Account" },
    {
      id: "profile-settings",
      label: "Account settings",
      icon: <Settings aria-hidden="true" />,
      onSelect: () => navigate("/app/settings"),
    },
    { type: "separator" },
    {
      id: "sign-out",
      label: "Sign out",
      icon: <LogOut aria-hidden="true" />,
      onSelect: () => {
        void logout().finally(() => navigate("/auth/login", { replace: true }));
      },
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          aria-hidden="true"
          tabIndex={-1}
          className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
          onClick={closeMobileNavigation}
        />
      ) : null}

      <aside
        id="app-navigation"
        aria-label="Application sidebar"
        role={isMobileOpen ? "dialog" : undefined}
        aria-modal={isMobileOpen ? true : undefined}
        ref={mobileNavigationRef}
        style={{ width: isCollapsed && !isMobileOpen ? 76 : 256 }}
        className={`fixed inset-y-0 inset-s-0 z-50 flex min-w-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 motion-reduce:transition-none md:translate-x-0 md:visible ${
          isMobileOpen ? "translate-x-0 visible" : "-translate-x-full invisible"
        }`}
      >
        <div
          className={`flex h-16 shrink-0 items-center justify-between gap-3 px-4 ${
            isCollapsed ? "md:justify-center md:gap-0 md:px-0" : ""
          }`}
        >
          <NavLink
            to="/app"
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
            ref={mobileNavigationCloseRef}
            className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring md:hidden"
            onClick={closeMobileNavigation}
          >
            <X className="size-4" />
          </button>
        </div>

        <nav
          aria-label="Primary navigation"
          className="min-h-0 flex-1 overflow-hidden px-3 py-4"
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
                      end={to === "/app"}
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

      <div
        className={`min-w-0 flex-1 flex-col md:flex ${
          isCollapsed ? "md:ms-19" : "md:ms-64"
        }`}
        inert={isMobileOpen}
      >
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              aria-controls="app-navigation"
              aria-expanded={isMobileOpen}
              ref={mobileNavigationTriggerRef}
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
              to="/app/notifications"
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
            <DropdownMenu
              label="Account menu"
              align="end"
              items={profileMenuItems}
              trigger={
                <button
                  type="button"
                  aria-label="Account menu"
                  title="Account menu"
                  className="flex size-9 items-center justify-center gap-2 rounded-md text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-auto lg:px-2"
                >
                  <Avatar name={profileName} src={user?.avatarUrl} size="sm" />
                  <span className="hidden max-w-36 truncate text-sm font-medium lg:inline">
                    {profileName}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="hidden size-4 text-muted-foreground lg:block"
                  />
                </button>
              }
            />
          </div>
        </header>

        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-screen-2xl">
            {!isContactsRoute && !isCompaniesRoute && !isDealsRoute ? (
              <PageHeader title={pageTitle} description="Your freelance workspace" />
            ) : null}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
