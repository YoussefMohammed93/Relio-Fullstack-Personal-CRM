# Relio — Project Progress & Execution Tracker

> This file is the master execution checklist for the Relio project.
> It tracks every planned phase, milestone, and implementation task from initial setup to production deployment.
>
> **Source of truth:**
> - `PRD.md` defines product requirements and business rules.
> - `ROADMAP.md` defines the development phases and their execution order.
> - `ARCHITECTURE.md` defines the technical architecture and engineering decisions.
> - `PROGRESS.md` tracks implementation status and completed work.

---

## 1. Project Status

| Property | Value |
|---|---|
| Project | Relio |
| Product | Personal CRM for Freelancers |
| Overall Status | In Progress |
| Current Phase | Phase 3 — Backend Infrastructure & API Foundation (In Progress) |
| Next Milestone | Milestone 3.7 — Backend Validation |
| Last Updated | 2026-11-01 |

### Status Definitions

- `Not Started`: No implementation has started.
- `In Progress`: Implementation is currently underway.
- `Completed`: All required tasks and acceptance criteria have been completed and validated.
- `Blocked`: Work cannot continue because of an unresolved dependency or issue.
- `Deferred`: Explicitly postponed to a future version or phase.

A phase must not be marked Completed just because its main UI or initial implementation exists. All required tasks and acceptance criteria must pass.

---

## 2. Overall Phase Tracker

| Phase | Name | Status |
|---|---|---|
| 1 | Monorepo Initialization & Project Foundation | Completed |
| 2 | Frontend Foundation & Design System | Completed |
| 3 | Backend Infrastructure & API Foundation | In Progress |
| 4 | Database Architecture & Data Modeling | Not Started |
| 5 | Authentication & User Management | Not Started |
| 6 | Core CRM Modules | Not Started |
| 7 | Calendar & Notifications | Not Started |
| 8 | Dashboard, Global Search & Data Export | Not Started |
| 9 | Landing Page & Onboarding | Not Started |
| 10 | Quality Assurance & Production Deployment | Not Started |

---

# Phase 1 — Monorepo Initialization & Project Foundation

**Status:** Completed

## Milestone 1.1 — Monorepo Setup

- [x] Initialize pnpm workspace.
- [x] Configure root `package.json`.
- [x] Configure `pnpm-workspace.yaml`.
- [x] Create `apps/client`.
- [x] Create `apps/server`.
- [x] Create `packages/shared`.
- [x] Configure root development scripts.
- [x] Configure root build scripts.
- [x] Configure root lint scripts.
- [x] Configure root formatting scripts.
- [x] Configure root typecheck scripts.
- [x] Configure `.gitignore`.

## Milestone 1.2 — Frontend Scaffold

- [x] Initialize React 19 application.
- [x] Configure Vite.
- [x] Configure TypeScript.
- [x] Configure Tailwind CSS v4.
- [x] Prepare shadcn-compatible conventions.
- [x] Configure application entry point.
- [x] Prepare routing.
- [x] Add TanStack Query.
- [x] Prepare React Hook Form.
- [x] Prepare Zod.
- [x] Prepare Zustand.
- [x] Configure frontend development port `3000`.

## Milestone 1.3 — Backend Scaffold

- [x] Initialize Express 5 application.
- [x] Configure TypeScript.
- [x] Configure `tsx`.
- [x] Configure backend development port `5000`.
- [x] Configure environment variable validation.
- [x] Configure CORS.
- [x] Configure cookie parsing.
- [x] Configure JSON body parsing.
- [x] Configure centralized error handling.
- [x] Add API health endpoint.
- [x] Prepare Mongoose infrastructure.
- [x] Prepare JWT and cookie infrastructure.

## Milestone 1.4 — Shared Configuration

- [x] Configure shared TypeScript conventions.
- [x] Configure ESLint.
- [x] Configure Prettier.
- [x] Create shared package exports.
- [x] Configure pnpm build/install behavior.

## Milestone 1.5 — Initial Validation

- [x] Install dependencies successfully.
- [x] Validate formatting.
- [x] Validate ESLint.
- [x] Validate TypeScript.
- [x] Validate production build.
- [x] Verify frontend returns HTTP 200.
- [x] Verify backend health endpoint.
- [x] Push initial project foundation to GitHub.

### Phase 1 Notes

- MongoDB connection is not considered implemented by merely preparing Mongoose infrastructure.
- Authentication is not implemented in this phase.
- CRM business modules are not implemented in this phase.
- Phase 1 foundation commit `8a1169e` is present on both local `main` and `origin/main`.

### Phase 1 Implementation Record

Implemented files and modules:

- Root configuration: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig.base.json`, `eslint.config.js`, `prettier.config.js`, `.gitignore`, `.prettierignore`, and `README.md`.
- Client configuration: `apps/client/package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, and `components.json`.
- Client modules: `src/main.tsx`, `src/app/App.tsx`, `src/providers/AppProviders.tsx`, `src/router/AppRouter.tsx`, `src/lib/query-client.ts`, and `src/styles/globals.css`; extension directories exist for components, features, hooks, shared code, and types. No product routes or feature components are implemented.
- Server configuration and modules: `apps/server/package.json`, `tsconfig.json`, `src/app.ts`, `src/server.ts`, `src/config/env.ts`, `src/config/security.ts`, `src/database/connect.ts`, `src/errors/AppError.ts`, `src/middleware/error-handler.ts`, `src/middleware/not-found.ts`, and `src/modules/health/health.routes.ts`.
- Shared: `packages/shared/package.json`, `tsconfig.json`, and `src/index.ts` provide `@relio/shared` exports and generic JSON types. No CRM/domain models are present.

Validation results recorded for the completed foundation:

- `pnpm install --frozen-lockfile` — passed.
- `pnpm format:check` — passed.
- `pnpm lint` — passed.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm --filter @relio/client typecheck` — passed after removing deprecated `baseUrl` and making the `@/*` path target explicitly relative.
- `pnpm dev` — both apps started; client returned HTTP 200 at `http://localhost:3000`, and `/api/v1/health` returned `{"status":"ok"}`.
- `pnpm dlx shadcn@latest info -c apps/client` — recognized Vite, Tailwind v4, aliases, and Lucide; no components are installed.

### Current Documentation State

- The current instructions refer to `docs/PRD.md`; that file has been reviewed in full. `docs/ROADMAP.md`, `docs/PROGRESS.md`, and `docs/ARCHITECTURE.md` are also present locally.
- The tracked legacy path `docs/Relio-PRD.md` is deleted in this worktree, while the current `docs/*.md` files are untracked. This state was preserved; confirm/stage the intended rename or replacement when preparing the documentation commit.
- `docs/PRD.md` section 29 was updated only to reflect the user-confirmed current phase and next milestone; no product requirement or business rule was changed.
- No application test framework or automated test suite is configured yet; testing remains planned in Phase 10.

## Current Known Issues and Blockers

- No Phase 1 application-code blocker is known from the recorded checks.
- Resolve the documentation tracking state described above when staging the docs; do not restore or discard the legacy PRD without user direction.

---

# Phase 2 — Frontend Foundation & Design System

**Status:** Completed

## Milestone 2.1 — Existing Frontend Audit

**Status:** Completed

- [x] Inspect the complete existing frontend structure.
- [x] Review installed dependencies.
- [x] Review Tailwind CSS v4 configuration.
- [x] Review existing shadcn-compatible setup.
- [x] Review current routing configuration.
- [x] Review TanStack Query setup.
- [x] Identify existing reusable components.
- [x] Identify duplicated or unnecessary dependencies.
- [x] Review existing fonts and typography.
- [x] Review existing CSS variables and theme configuration.
- [x] Document what can be reused.
- [x] Avoid recreating existing working infrastructure.

### Milestone 2.1 Audit Record

Inspected the client package manifest, source tree, app entry point, provider composition, router, QueryClient, global stylesheet, Vite configuration, and shadcn `components.json`.

Reusable foundation:

- React 19, Vite, TypeScript, Tailwind CSS v4 through `@tailwindcss/vite`, React Router, and the `@/*` source alias are configured.
- `AppProviders` already provides the shared TanStack Query client. The client uses a 30-second query stale time, one retry, and disables refetch-on-window-focus.
- At the time of this audit, `globals.css` imported variable fonts through Fontsource. Semantic light-theme CSS variables and shadcn-compatible Tailwind mappings already existed; the current font implementation is recorded in Milestone 2.4 below.
- `components.json` configures the shadcn New York conventions, CSS variables, aliases, and Lucide icons.
- React Hook Form, Zod, `@hookform/resolvers`, Zustand, and Lucide are already declared; no duplicate UI or state libraries were found in the client manifest.

Gaps confirmed for later Phase 2 milestones:

- No Hairline registry components or reusable UI components exist in the source tree.
- There is no theme provider, dark/system token set, or persisted theme preference. Current tokens are light-only and the primary color is neutral rather than the specified Relio blue.
- `AppRouter` currently has one catch-all route with a null element; there are no route layouts or placeholder pages.
- No application shell, shared component patterns, notification/toast provider, or tooltip provider exists.
- The prepared form and client-state dependencies are not used in the current source, but are retained as planned stack dependencies; no dependency removal was warranted by this audit.

Validation:

- `pnpm --filter @relio/client typecheck` — passed.
- Source search confirmed the router is the only existing route/UI integration among the inspected patterns.

No application code or dependencies were changed during this audit. Hairline discovery and integration remain in Milestone 2.2.

## Milestone 2.2 — Hairline UI Integration

**Status:** Completed

- [x] Review official Hairline UI documentation.
- [x] Inspect available Hairline UI components.
- [x] Inspect Hairline CLI and installation workflow.
- [x] Review the installed Hairline MCP integration.
- [x] Use the MCP documentation and component discovery capabilities when available.
- [x] Integrate Hairline UI using its recommended conventions.
- [x] Verify compatibility with React 19 and Tailwind CSS v4.
- [x] Verify compatibility with existing shadcn conventions.
- [x] Avoid duplicating components already provided by Hairline.
- [x] Verify that installed components work correctly.
- [x] Document any integration limitations.

### Milestone 2.2 Integration Record

Used the Hairline MCP component list, discovery search, component documentation, source inspection, and package-manager-specific install command. Installed the reusable base `Button` and `Input` components with their shared helpers through the documented shadcn registry flow.

Added client source files:

- `apps/client/src/components/button.tsx`
- `apps/client/src/components/input.tsx`
- `apps/client/src/components/field.tsx`
- `apps/client/src/components/text-morph.tsx`
- `apps/client/src/components/ui-interaction-motion.ts`

The installation added no npm dependencies and made no changes to `components.json`, the lockfile, or global CSS. The components use the existing semantic tokens, React 19 APIs, Lucide-compatible slots, and reduced-motion behavior. No competing UI library or duplicate component implementation was introduced.

Validation:

- `pnpm dlx shadcn@latest info -c apps/client` — recognized Vite, Tailwind v4, React SPA configuration, aliases, and Lucide.
- `pnpm --filter @relio/client typecheck` — passed.
- `pnpm --filter @relio/client lint` — passed with four non-blocking `react-refresh/only-export-components` warnings in Hairline's shared `field.tsx` utility exports.
- `pnpm --filter @relio/client build` — passed.
- `pnpm exec prettier --check` on the five added files — passed.
- Editor diagnostics reported no errors in the added files.

Limitations: the shadcn CLI's Installed Components list reports only its own registry and does not enumerate the separately installed Hairline files. The app still has no route that renders UI, so visual and interactive verification is deferred until the application shell is added. Light/Dark/System theme support is not part of this integration milestone.

## Milestone 2.3 — Design Tokens & Visual Foundation

**Status:** Completed

- [x] Establish Relio's visual design direction.
- [x] Configure semantic color tokens.
- [x] Configure primary blue accent.
- [x] Configure background and foreground tokens.
- [x] Configure card and popover tokens.
- [x] Configure primary and secondary tokens.
- [x] Configure muted and accent tokens.
- [x] Configure destructive and success states.
- [x] Configure border and input tokens.
- [x] Configure focus ring tokens.
- [x] Configure chart color tokens.
- [x] Configure sidebar tokens.
- [x] Configure radius and sizing conventions.
- [x] Avoid arbitrary hardcoded colors.
- [x] Ensure components use semantic design tokens.
- [x] Review Hairline default tokens before overriding them.

### Milestone 2.3 Token Record

Updated `apps/client/src/styles/globals.css` with a restrained cool-neutral surface palette, Relio blue primary accent, semantic success/warning/info/destructive colors, differentiated chart colors, and dedicated sidebar tokens. Light tokens are the default; matching dark tokens are available through `.dark`, with a `prefers-color-scheme: dark` fallback unless `.light` is explicitly selected.

Tailwind v4 `@theme inline` now exposes semantic colors, chart/sidebar colors, radius sizes, and named page/section/control spacing and control-height utilities. Hairline components continue to consume the shared semantic variables; no component-specific palette was introduced.

Validation:

- Contrast calculation for 20 representative light/dark text and surface pairs — all met or exceeded 4.5:1.
- `pnpm --filter @relio/client typecheck` — passed.
- `pnpm --filter @relio/client lint` — passed with four existing non-blocking `react-refresh/only-export-components` warnings in Hairline's `field.tsx`.
- `pnpm --filter @relio/client build` — passed.
- `pnpm exec prettier --check apps/client/src/styles/globals.css` — passed.

Theme selection UI, persistence, and pre-paint handling remain in Milestone 2.5; this milestone provides the semantic palettes and system CSS fallback only.

## Milestone 2.4 — Typography

**Status:** Completed

- [x] Inspect Hairline's default typography.
- [x] Configure Inter Tight as the primary interface font.
- [x] Retain a generic monospace fallback only for technical contexts.
- [x] Establish heading hierarchy.
- [x] Establish body text hierarchy.
- [x] Establish label and helper text styles.
- [x] Establish numeric and tabular data typography.
- [x] Verify typography across desktop and mobile.

### Milestone 2.4 Typography Record

The original typography implementation has been replaced with the official Google Fonts Inter Tight variable family, self-hosted through `@fontsource-variable/inter-tight`. Its variable face supports weights 100–900; the interface uses 400 body text, 500 labels/data, 600 buttons/section headings, and 700 display/page titles. The global body baseline remains 15px/24px. Tailwind v4's `font-sans` and the root font-family share Inter Tight, while its `font-mono` utility uses a generic system stack for technical contexts only.

Tailwind typography roles remain configured for display, page title, section title, body, small body, label, caption, and data. Numeric and tabular data use the existing `text-data` role and tabular number styling without making a separate mono family the general interface font.

Validation:

- `pnpm --filter @relio/client typecheck` — passed.
- `pnpm --filter @relio/client lint` — passed with four existing non-blocking `react-refresh/only-export-components` warnings in Hairline's `field.tsx`.
- `pnpm --filter @relio/client build` — passed.
- `pnpm exec prettier --check apps/client/src/styles/globals.css` — passed.
- The Inter Tight replacement is documented in the Typography Replacement Record below; its responsive and theme behavior inherits the existing root typography baseline.

Limitation: the router still renders no page, so actual heading, label, and table typography cannot yet be visually reviewed in context. The typography scale and responsive base metrics are in place; rendered component review remains for the application shell milestone.

### Typography Replacement Record — 2026-10-31

Replaced the prior sans and mono font dependencies with `@fontsource-variable/inter-tight`. The font is imported once from `globals.css`, bundled as WOFF2 assets by Vite, and applied through the root family and Tailwind v4 `--font-sans` token. The package's variable face supports weights 100–900. Both light and dark themes inherit the same typography; no theme-specific font overrides were added. Updated both SVG wordmarks and the PRD, roadmap, and architecture references. Milestone and phase status are unchanged.

Validation:

- `pnpm install --no-frozen-lockfile` — passed; replaced the prior font packages with the Inter Tight variable package and updated the lockfile.
- `pnpm format` — passed.
- `pnpm lint` — passed with zero errors and six existing non-blocking Fast Refresh warnings.
- `pnpm typecheck` — passed for all workspace packages.
- `pnpm build` — passed for shared, client, and server packages; the client emitted Inter Tight variable WOFF2 assets.
- Browser verification — the computed body family is `Inter Tight Variable`, weights 400 and 700 load, and the 15px/24px body baseline remains unchanged. Light and Dark themes use the same font. At 320px and 375px viewport widths, the document has no horizontal overflow.

The remaining theme-surface verification in Milestone 2.5 is unchanged.

## Milestone 2.5 — Theme Management

- **Status:** Completed

- [x] Implement Light theme.
- [x] Implement Dark theme.
- [x] Implement System theme.
- [x] Persist user theme preference.
- [x] Respect system preference when System is selected.
- [x] Prevent theme flashing where possible.
- [x] Verify all semantic tokens in both themes.
- [x] Verify tables, dialogs, dropdowns, and side sheets in both themes.
- [x] Verify charts and illustrations in both themes.
- [x] Add reusable theme switcher.

### Milestone 2.5 Theme Management Record

Added `ThemeProvider`, its shared context/hook, and a reusable `ThemeSwitcher` wrapper around Hairline's segmented `ThemeToggle`. `AppProviders` now wraps the application in the theme provider. The preference (`light`, `dark`, or `system`) is stored as `relio-theme` in localStorage; the provider applies the matching root class and tracks operating-system color-scheme changes while System is selected. An inline bootstrap in `apps/client/index.html` applies the stored/system theme before the React module loads. Invalid stored values fall back to System, and restricted localStorage does not prevent the current session from changing themes. Hairline's registry component was installed without replacing the existing `TextMorph` source or adding a package dependency.

A dev-only verification surface was added at `apps/client/src/app/theme-surface-preview.tsx` and exposed in `AppRouter` under the `/__theme-preview` route in development. The page renders an illustrative pipeline chart, menu, empty-state illustration, searchable table, dialog, and side sheet using the active theme tokens. This route is intentionally non-product and is not wired to CRM data or application records.

Validation:

- `pnpm --filter @relio/client typecheck` — passed.
- `pnpm --filter @relio/client lint` — passed with 0 errors and 10 warnings, all non-blocking Fast Refresh / exhaustive-deps warnings in shared Hairline-generated or provider files.
- `pnpm --filter @relio/client build` — passed.
- Browser verification on `http://localhost:3000/__theme-preview` — the page rendered the chart, empty state, table, menu, dialog, and side sheet; the theme controls responded correctly in Light, Dark, and System modes; the browser snapshot confirmed the required surfaces were present and themed.
- Prettier check on changed theme files — passed.

This milestone is considered complete because the missing rendered surfaces were implemented as a minimal, development-only verification layer and validated in context. No later-phase CRM functionality was introduced.

## Milestone 2.6 — Global Application Providers

**Status:** Completed

- [x] Implement the application provider composition.
- [x] Configure Router provider.
- [x] Configure TanStack Query provider.
- [x] Configure Theme provider.
- [x] Configure global notification/toast provider.
- [x] Configure global tooltip provider if required.
- [x] Keep provider composition clean and maintainable.
- [x] Avoid unnecessary nested providers.

### Milestone 2.6 Provider Composition Record

Added a dedicated `NotificationProvider` and `TooltipProvider`, and composed them within the existing `ThemeProvider` + `QueryClientProvider` chain in `AppProviders`. The router remains encapsulated in `AppRouter`, and the provider tree now keeps application-wide concerns in one place without unnecessary nesting. The provider layer is ready for the upcoming shell and route milestones without introducing a new UI dependency or duplicating existing client infrastructure.

Validation:

- `pnpm --filter @relio/client typecheck` — passed.
- `pnpm --filter @relio/client lint` — passed with six non-blocking Fast Refresh warnings shared by the existing Hairline `field.tsx` export pattern and the new provider files.
- `pnpm --filter @relio/client build` — passed.

Milestone 2.7 — Application Shell is completed below. Theme-surface verification for Milestone 2.5 is recorded as completed above; no CRM feature work began.

## Milestone 2.7 — Application Shell

**Status:** Completed

- [x] Implement the main application layout.
- [x] Implement responsive sidebar.
- [x] Implement sidebar navigation structure.
- [x] Implement active navigation states.
- [x] Implement sidebar collapse/expand behavior.
- [x] Implement mobile navigation behavior.
- [x] Implement top navigation bar.
- [x] Implement breadcrumbs component.
- [x] Implement reusable page header.
- [x] Implement profile menu placeholder.
- [x] Implement notification access placeholder.
- [x] Implement global search trigger placeholder.
- [x] Implement main content container.
- [x] Establish consistent page spacing.
- [x] Verify layout responsiveness.

### Milestone 2.7 Application Shell Record

Added `AppShell` as the catch-all route layout with responsive sidebar navigation, active states, desktop collapse, a mobile drawer, top navigation, breadcrumbs, reusable page header, and a constrained main content container. Search and profile actions provide explicit placeholder feedback; notification access links to its shell navigation entry. The existing theme switcher is available in the shell. No CRM pages or route groups were added; those remain in Milestone 2.8.

Files:

- `apps/client/src/app/layouts/app-shell.tsx`
- `apps/client/src/components/breadcrumbs.tsx`
- `apps/client/src/components/page-header.tsx`
- `apps/client/src/router/AppRouter.tsx`

Validation:

- `pnpm --filter @relio/client typecheck` — passed.
- `pnpm --filter @relio/client lint` — passed with six existing non-blocking Fast Refresh warnings in shared provider/component files.
- `pnpm --filter @relio/client build` — passed.
- `pnpm exec prettier --check` on the changed client files — passed.
- Browser verification at 1440px, 375px, and 320px — no horizontal overflow at 1440px or 320px; desktop collapse and active navigation worked; mobile navigation opened and closed after selecting a route; the search placeholder returned feedback.
- Editor diagnostics — no errors in changed client files.

Milestone 2.5 theme-surface verification is recorded as completed above using the development-only preview route. Phase 2 remains In Progress; the next incomplete milestone is 2.9 — Reusable UI Components.

## Milestone 2.8 — Routing Architecture

- [x] Establish public route group.
- [x] Establish authentication route group.
- [x] Establish protected application route group.
- [x] Configure route layouts.
- [x] Configure nested routes where appropriate.
- [x] Add dashboard placeholder.
- [x] Add Contacts placeholder.
- [x] Add Companies placeholder.
- [x] Add Deals placeholder.
- [x] Add Tasks placeholder.
- [x] Add Calendar placeholder.
- [x] Add Activities placeholder.
- [x] Add Settings placeholder.
- [x] Add Not Found page.
- [x] Prepare route protection integration for Phase 5.
- [x] Avoid implementing actual authentication in this phase.

### Milestone 2.8 Routing Architecture Record

Established three explicit route groups: `/` for the public placeholder, `/auth/*` for authentication placeholders, and `/app/*` for the workspace shell and its nested placeholder routes. The application group includes Dashboard, Contacts, Companies, Deals, Tasks, Calendar, Activities, Notifications, and Settings. Unknown URLs render a dedicated Not Found page; the development-only `/__theme-preview` route remains available.

The `/app` group is not access-controlled yet. Phase 5 will add the actual authentication guard; no authentication logic or CRM workflows were introduced. Sidebar, overview, logo, and notification navigation now use `/app` paths.

Files:

- `apps/client/src/router/AppRouter.tsx`
- `apps/client/src/router/route-pages.tsx`
- `apps/client/src/app/layouts/app-shell.tsx`

Validation:

- Browser verification — `/` rendered the public placeholder, `/auth/login` rendered the authentication placeholder, `/app/contacts` rendered the application shell with the Contacts title and active navigation, and an unknown URL rendered the Not Found page.
- `pnpm lint` — passed with zero errors and 10 existing warnings in shared components/providers.
- `pnpm typecheck` — passed for all workspace packages.
- `pnpm build` — passed for shared, client, and server packages.
- `pnpm format:check` — passed.
- No automated route test framework is configured; route behavior was checked in the browser.

Phase 2 remains In Progress. The next incomplete milestone is 2.9 — Reusable UI Components.

## Milestone 2.9 — Reusable UI Components

**Status:** Completed

Implement or integrate reusable components using Hairline UI whenever available.

- [x] Buttons.
- [x] Inputs.
- [x] Textareas.
- [x] Selects.
- [x] Checkboxes.
- [x] Radio groups.
- [x] Switches.
- [x] Labels.
- [x] Form field wrappers.
- [x] Dialogs.
- [x] Alert dialogs.
- [x] Side sheets.
- [x] Dropdown menus.
- [x] Context menus where needed.
- [x] Tabs.
- [x] Tooltips.
- [x] Popovers.
- [x] Tables.
- [x] Badges.
- [x] Avatars.
- [x] Cards.
- [x] Skeletons.
- [x] Empty states.
- [x] Confirmation dialogs.
- [x] Toast notifications.
- [x] Loading indicators.
- [x] Pagination primitives.
- [x] Search input.
- [x] Filter controls.

### Milestone 2.9 Reusable UI Components Record

The reusable component foundation now covers the milestone checklist using Hairline source components where already installed and local components built on the existing semantic tokens. `PillSelect` supplies the select/listbox control; `ConfirmationDialog` composes the dialog primitive for destructive decisions; `Sheet` supplies side sheets; and `DropdownMenu`/`MenuList` provide action menus. The notification provider renders dismissible toast notifications. No context-menu interaction is currently defined in the application, so a separate context-menu primitive was not added.

Added or extended the component surface in `apps/client/src/components/`, including Avatar, Badge, Checkbox, ConfirmationDialog, FilterBar, Pagination, Popover, RadioGroup, SearchInput, Skeleton, Spinner, Switch, Tabs, Textarea, Tooltip, and Card. Shared skeleton/loading animation tokens were added to `apps/client/src/styles/globals.css`.

Added the development-only `/__components-preview` route and `apps/client/src/app/component-surface-preview.tsx`. It exercises the shared controls, overlays, table, filter/search, states, and toast with local fixture state only; it does not read or modify CRM records.

Validation:

- `pnpm --filter @relio/client typecheck` — passed.
- `pnpm --filter @relio/client lint` — passed with zero errors and 12 non-blocking warnings (Fast Refresh export warnings and existing `NumberRoll` hook warnings).
- `pnpm --filter @relio/client build` — passed.
- `pnpm format:check` — passed.
- Browser verification at `/__components-preview` — rendered the component surface; selecting a different `PillSelect` option updated its value and the toast action displayed a dismissible notification. The requested 375px viewport was reported by the integrated browser as 469 CSS px (450px document client/scroll width); no horizontal document overflow was present at the measured width. Exact 320px/375px responsive checks remain in Milestone 2.10.

Phase 2 remains In Progress. The next incomplete milestone is 2.10 — Responsive & Accessibility Foundation.

## Milestone 2.10 — Responsive & Accessibility Foundation

**Status:** Completed

- [x] Verify desktop layouts.
- [x] Verify laptop layouts.
- [x] Verify tablet layouts.
- [x] Verify mobile layouts.
- [x] Verify keyboard navigation.
- [x] Verify visible focus states.
- [x] Verify semantic HTML.
- [x] Verify form labels.
- [x] Verify dialog accessibility.
- [x] Verify sufficient color contrast.
- [x] Verify reduced-motion preferences where applicable.

### Milestone 2.10 Responsive & Accessibility Record

Responsive and accessibility verification covered the application shell and development-only component preview. The shell's closed mobile sidebar is now hidden from keyboard and accessibility navigation while remaining visible at desktop breakpoints. The mobile drawer moves focus into the panel, traps Tab/Shift+Tab, closes on Escape or route selection, restores focus to its opener, makes the page inert, and locks background scrolling. Overview navigation now matches only `/app` instead of remaining active on nested routes. Removed the global 320px body minimum that caused horizontal overflow when the browser's vertical scrollbar reduced the content width; added a programmatic label to the preview SearchInput.

Browser verification:

- Application shell at 320px, 375px, 768px, 1024px, and 1440px CSS widths — no horizontal overflow; mobile navigation was available only below the desktop breakpoint; desktop sidebar remained visible.
- Component preview at the same widths — no horizontal overflow after removing the body minimum width.
- Mobile keyboard behavior — focus entered the drawer, wrapped at both focus boundaries, Escape closed it, scroll/inert state was released, and focus returned to the opener. Selecting a route closed the drawer and left exactly one active navigation item.
- Closed mobile sidebar — offscreen links could not receive focus; desktop links remained available.
- Visible focus — keyboard navigation applied the visible focus ring to the active navigation item.
- Semantics and labels — one main landmark, named primary navigation, one page heading, and programmatic labels for all preview inputs and textareas.
- Dialog preview — native modal dialog had an associated title, placed focus inside the panel, and returned focus to its trigger after close.
- Color contrast — six representative text/surface and button pairs in both Light and Dark themes measured at least 6.06:1.
- Reduced motion — `prefers-reduced-motion: reduce` matched and the sidebar transition property computed to `none`.

Files changed:

- `apps/client/src/app/layouts/app-shell.tsx`
- `apps/client/src/app/component-surface-preview.tsx`
- `apps/client/src/styles/globals.css`

Validation:

- Prettier check on the three changed client files — passed.
- `pnpm --filter @relio/client lint` — passed with 0 errors and 12 non-blocking warnings in existing components/providers.
- `pnpm --filter @relio/client typecheck` — passed.
- `pnpm --filter @relio/client build` — passed.
- Browser verification was performed interactively; the repository does not yet have an automated browser test framework.

No Architecture or Roadmap update was needed. Phase 2 remains In Progress; the next incomplete milestone is 2.11 — Phase Validation.

## Milestone 2.11 — Phase Validation

- [x] Run formatting.
- [x] Run ESLint.
- [x] Run TypeScript checks.
- [x] Run production build.
- [x] Fix all introduced errors.
- [x] Verify Light theme.
- [x] Verify Dark theme.
- [x] Verify System theme.
- [x] Verify responsive application shell.
- [x] Verify route navigation.
- [x] Update `PROGRESS.md`.
- [x] Update `ROADMAP.md`.
- [x] Update `ARCHITECTURE.md` if actual architectural decisions changed.

### Phase 2 Acceptance Criteria

- [x] Hairline UI is integrated correctly.
- [x] The design system uses semantic tokens.
- [x] Light, Dark, and System themes work.
- [x] The application shell is responsive.
- [x] Routing architecture is established.
- [x] Reusable UI foundations are available.
- [x] No actual CRM business modules or authentication are implemented yet.
- [x] All required validation commands pass.

### Phase 2 Validation Record

Phase 2 is complete. All milestones 2.1–2.11 and phase acceptance criteria are verified. No CRM business modules or authentication were added.

Validation:

- `pnpm format:check` — passed.
- `pnpm lint` — passed with 0 errors and 12 non-blocking warnings in existing components/providers.
- `pnpm typecheck` — passed for shared, server, and client workspace packages.
- `pnpm build` — passed for shared, client, and server packages.
- Browser verification — Light and Dark preferences persisted across reloads. System preference selected correctly and loaded the dark palette with a dark OS preference. The browser bridge changed `matchMedia.matches` without emitting a media-query `change` event, so live OS switching could not be exercised in this browser session; the provider's listener remains in place.
- Responsive shell at 320px, 375px, 768px, 1024px, and 1440px — no horizontal overflow; desktop and mobile navigation behaviors were verified.
- Route smoke checks — `/`, `/auth/login`, `/app/contacts`, `/app/companies`, and an unknown route rendered their expected pages; active navigation and mobile route selection were verified.

No Architecture update was needed because no architectural decision changed. Phase 3 remains Not Started and requires the user's instruction before work begins.

---

# Phase 3 — Backend Infrastructure & API Foundation

**Status:** In Progress

## Milestone 3.1 — Backend Audit

- [x] Inspect existing Express application.
- [x] Review existing middleware.
- [x] Review environment validation.
- [x] Review CORS and cookie configuration.
- [x] Review error handling.
- [x] Review API health endpoint.
- [x] Review existing Mongoose and JWT preparation.
- [x] Reuse existing working infrastructure.

### Milestone 3.1 Audit Record

- Reused the existing Express app, health route, custom error class, and MongoDB helper instead of replacing them.
- Added a safer environment schema, startup-level database lifecycle handling, request logging, rate limiting, and security headers in the existing server bootstrap.
- Preserved the Phase 1 health endpoint while updating the response contract to the newer API format.

## Milestone 3.2 — Database Connection

- [x] Configure MongoDB Atlas connection lifecycle.
- [x] Validate database environment variables.
- [x] Implement connection lifecycle.
- [x] Handle connection failures.
- [x] Handle graceful shutdown.
- [x] Avoid starting the application in an invalid database state.
- [x] Verify successful database connection where the environment is configured.

## Milestone 3.3 — API Standards

- [x] Establish consistent success response structure.
- [x] Establish consistent error response structure.
- [x] Establish API status code conventions.
- [x] Establish API versioning conventions.
- [x] Establish pagination response conventions.
- [ ] Establish filtering conventions.
- [ ] Establish sorting conventions.
- [x] Establish request validation conventions.
- [ ] Establish controller/service responsibilities.

### Milestone 3.3 API Standards Record

- Added shared response helpers for API payload envelopes and pagination metadata to keep backend responses consistent across routes.
- Added request validation middleware built on Zod so incoming body, query, and params payloads can be validated before controller logic runs.
- Updated the health route and global error handler to use the shared success/error response contract.

## Milestone 3.4 — Security & Middleware

- [x] Review and secure CORS configuration.
- [x] Configure secure cookie defaults.
- [x] Add security headers.
- [x] Configure request body limits.
- [x] Add rate limiting.
- [x] Add request logging.
- [x] Configure request ID or correlation ID if useful.
- [x] Ensure secrets are never exposed.
- [x] Ensure production error responses do not leak internal details.

## Milestone 3.5 — Shared Backend Utilities

- [x] Implement reusable pagination utility.
- [x] Implement reusable filtering utility.
- [x] Implement reusable sorting utility.
- [x] Implement reusable validation helpers.
- [x] Implement reusable API response helpers.
- [x] Implement reusable error classes.
- [x] Implement ownership-checking utilities where appropriate.

### Milestone 3.5 Shared Backend Utilities Record

- Added shared pagination, filtering, and sorting helpers for backend query construction and request normalization.
- Added reusable validation helpers for sanitizing text, parsing positive integers, validating Mongo ObjectIds, and enforcing ownership checks.
- Added shared error classes that extend the existing AppError contract so backend modules can reuse a consistent validation, not-found, and forbidden response pattern.

## Milestone 3.6 — File Upload Foundation

- [x] Select an appropriate image storage approach.
- [x] Configure upload validation.
- [x] Validate file type.
- [x] Validate file size.
- [x] Prepare company logo upload support.
- [x] Secure upload endpoints.
- [x] Document storage configuration.

### Milestone 3.6 File Upload Foundation Record

- Selected Cloudinary for company-logo image storage. The server validates Cloudinary configuration as an all-or-none set of environment variables. Runtime values are supplied through the ignored `apps/server/.env`; no environment template is retained in the repository.
- Added an in-memory single-file upload parser with a 5 MiB limit, one-file/one-part limits, and content-signature validation restricted to JPEG, PNG, and WebP. Browser-provided MIME types are not trusted.
- Added a Cloudinary upload service that stores images under `relio/company-logos`, requests secure URLs, and limits dimensions to 1200 by 1200 pixels.
- Added a company-logo route factory that requires authentication middleware to be supplied by the caller. It is intentionally not mounted because authentication is not implemented until Phase 5; no unauthenticated upload endpoint is exposed in Phase 3.
- Multer file-size and parsing errors now use the standard API error envelope with 413 or 400 status codes.
- Validation: 12 server tests passed; server lint, production TypeScript build, and Prettier check passed. The upload tests load the server environment schema. External Cloudinary upload was not attempted; provider credentials and network access were not verified against Cloudinary.
- Security follow-up: a failed patch response exposed the existing database URI and JWT value in tool output. Rotate those credentials before relying on them; Cloudinary credentials should also be rotated if exposed in shared logs.

## Milestone 3.7 — Backend Validation

- [ ] Verify health endpoint.
- [ ] Verify database connectivity.
- [ ] Verify environment validation.
- [ ] Verify error handling.
- [ ] Verify security middleware.
- [ ] Run lint.
- [ ] Run typecheck.
- [ ] Run production build.
- [ ] Update project documentation.

### Phase 3 Acceptance Criteria

- Backend infrastructure is production-oriented.
- MongoDB connection works.
- API conventions are consistent.
- Security middleware is configured.
- Reusable backend utilities are available.
- Existing Phase 1 infrastructure has been reused rather than duplicated.

---

# Phase 4 — Database Architecture & Data Modeling

**Status:** Not Started

## Milestone 4.1 — Data Model Design

- [ ] Review PRD data requirements.
- [ ] Define User model.
- [ ] Define Contact model.
- [ ] Define Company model.
- [ ] Define PipelineStage model.
- [ ] Define Deal model.
- [ ] Define Task model.
- [ ] Define Activity model.
- [ ] Define DealHistory model.
- [ ] Define Notification model.
- [ ] Define relationships and references.
- [ ] Define required and optional fields.
- [ ] Define timestamps.
- [ ] Define ownership rules.
- [ ] Define deletion behavior.
- [ ] Review model design against all PRD business rules.

## Milestone 4.2 — User Model

- [ ] Define username.
- [ ] Define email.
- [ ] Define password storage.
- [ ] Define Google account information where needed.
- [ ] Define profile fields.
- [ ] Define default avatar behavior.
- [ ] Define timestamps.
- [ ] Add required indexes.
- [ ] Enforce email uniqueness.

## Milestone 4.3 — Contact Model

- [ ] Define first name.
- [ ] Define last name.
- [ ] Define email.
- [ ] Define phone.
- [ ] Define optional Company reference.
- [ ] Define Contact Type.
- [ ] Define job title.
- [ ] Define tags.
- [ ] Define website.
- [ ] Define notes.
- [ ] Define owner reference.
- [ ] Define timestamps.
- [ ] Add appropriate indexes.

## Milestone 4.4 — Company Model

- [ ] Define company name.
- [ ] Define website.
- [ ] Define industry.
- [ ] Define email.
- [ ] Define phone.
- [ ] Define address.
- [ ] Define description.
- [ ] Define company size.
- [ ] Define annual revenue.
- [ ] Define LinkedIn URL.
- [ ] Define logo.
- [ ] Define owner reference.
- [ ] Define timestamps.
- [ ] Add appropriate indexes.

## Milestone 4.5 — Pipeline Stage Model

- [ ] Define stage name.
- [ ] Define stage color.
- [ ] Define stage order.
- [ ] Define default stages.
- [ ] Define owner reference.
- [ ] Define timestamps.
- [ ] Define terminal Deal statuses separately from ordinary stages.
- [ ] Add appropriate indexes.

## Milestone 4.6 — Deal Model

- [ ] Define deal name.
- [ ] Define deal value.
- [ ] Define primary Contact reference.
- [ ] Define optional Company reference.
- [ ] Define Pipeline Stage reference.
- [ ] Define probability.
- [ ] Define expected closing date.
- [ ] Define description.
- [ ] Define status.
- [ ] Define lost reason.
- [ ] Define actual closing date.
- [ ] Define final deal value.
- [ ] Define previous ordinary stage for reopening.
- [ ] Define owner reference.
- [ ] Define timestamps.
- [ ] Add appropriate indexes.

## Milestone 4.7 — Task Model

- [ ] Define title.
- [ ] Define description.
- [ ] Define task type.
- [ ] Define status.
- [ ] Define priority.
- [ ] Define optional due date.
- [ ] Define optional due time.
- [ ] Define optional related entity.
- [ ] Ensure a task relates to no more than one entity.
- [ ] Define reminder settings.
- [ ] Define completion timestamp.
- [ ] Define owner reference.
- [ ] Define timestamps.
- [ ] Add appropriate indexes.

## Milestone 4.8 — Activity Model

- [ ] Define activity type: Note, Call, Email, Meeting.
- [ ] Define title.
- [ ] Define description/content.
- [ ] Define related Contact.
- [ ] Define related Deal.
- [ ] Define related Company.
- [ ] Define activity date.
- [ ] Define scheduled date/time where applicable.
- [ ] Define owner reference.
- [ ] Define timestamps.
- [ ] Add appropriate indexes.

## Milestone 4.9 — Deal History Model

- [ ] Define Deal reference.
- [ ] Define history event type.
- [ ] Define previous value where applicable.
- [ ] Define new value where applicable.
- [ ] Define previous stage where applicable.
- [ ] Define new stage where applicable.
- [ ] Define event date.
- [ ] Define owner reference.
- [ ] Preserve history independently of Contact Activities.

## Milestone 4.10 — Notification Model

- [ ] Define notification type.
- [ ] Define title.
- [ ] Define message.
- [ ] Define related entity.
- [ ] Define read/unread state.
- [ ] Define owner reference.
- [ ] Define timestamps.
- [ ] Add appropriate indexes.

## Milestone 4.11 — Relationships & Data Integrity

- [ ] Ensure every user-owned record references its owner.
- [ ] Ensure Contact can have zero or one Company.
- [ ] Ensure Company can have multiple Contacts.
- [ ] Ensure a new Deal requires a Primary Contact.
- [ ] Ensure Deal can remain after Contact deletion.
- [ ] Ensure Deal History survives Contact deletion.
- [ ] Ensure Company deletion unlinks Contacts.
- [ ] Ensure Company deletion unlinks Deals.
- [ ] Ensure historical Activities are preserved when Company is deleted.
- [ ] Define Pipeline Stage deletion and reassignment behavior.
- [ ] Ensure user ownership is respected across references.

## Milestone 4.12 — Database Seed & Validation

- [ ] Create development seed infrastructure.
- [ ] Create default Pipeline Stages.
- [ ] Prepare realistic development data.
- [ ] Avoid fake production testimonials or metrics.
- [ ] Validate schemas.
- [ ] Validate indexes.
- [ ] Validate relationships.
- [ ] Validate deletion behavior.
- [ ] Update architecture documentation.

### Phase 4 Acceptance Criteria

- All required models exist.
- Relationships and ownership rules are enforced.
- Deletion behavior follows the PRD.
- Default development data can be seeded.
- Database schemas and indexes are validated.

---

# Phase 5 — Authentication & User Management

**Status:** Not Started

## Milestone 5.1 — Authentication Backend

- [ ] Implement user registration.
- [ ] Validate username.
- [ ] Validate email.
- [ ] Validate password.
- [ ] Hash passwords securely.
- [ ] Implement email/password login.
- [ ] Implement Google OAuth.
- [ ] Implement logout.
- [ ] Generate JWT.
- [ ] Store JWT in secure HTTP-only cookies.
- [ ] Configure cookie expiration.
- [ ] Configure SameSite behavior.
- [ ] Configure Secure behavior for production.
- [ ] Implement authentication middleware.
- [ ] Implement protected API routes.
- [ ] Implement current-user endpoint.
- [ ] Implement session restoration.
- [ ] Implement forgot-password request.
- [ ] Implement password reset token.
- [ ] Implement password reset endpoint.
- [ ] Configure password reset email delivery.
- [ ] Implement change-password endpoint.
- [ ] Implement profile retrieval.
- [ ] Implement profile update.
- [ ] Prevent email changes.
- [ ] Implement account deletion.
- [ ] Persist user theme preference: Light, Dark, or System.
- [ ] Persist notification preferences.
- [ ] Persist the user's default currency, initially USD.
- [ ] Do not add currency conversion or multi-currency support to the MVP.

## Milestone 5.2 — Authorization & Ownership

- [ ] Enforce user ownership on every protected resource.
- [ ] Prevent access to other users' records.
- [ ] Validate ownership of referenced entities.
- [ ] Protect update operations.
- [ ] Protect delete operations.
- [ ] Prevent cross-user relationship references.
- [ ] Verify authorization in all CRM modules.

## Milestone 5.3 — Authentication Frontend

- [ ] Create Login page.
- [ ] Create Register page.
- [ ] Create Forgot Password page.
- [ ] Create Reset Password page.
- [ ] Implement form validation.
- [ ] Implement password visibility.
- [ ] Implement Google sign-in button.
- [ ] Implement authentication state.
- [ ] Implement session restoration.
- [ ] Implement protected routes.
- [ ] Implement logout behavior.
- [ ] Implement user profile menu.
- [ ] Implement Profile Settings for username, avatar, and basic profile information.
- [ ] Implement Security Settings for password changes and account deletion; do not add email changes.
- [ ] Implement Preferences for theme, notification preferences, and default currency.
- [ ] Implement authentication loading states.
- [ ] Implement error and success feedback.

## Milestone 5.4 — Authentication Testing

- [ ] Test successful registration.
- [ ] Test duplicate email registration.
- [ ] Test invalid credentials.
- [ ] Test successful login.
- [ ] Test logout.
- [ ] Test session restoration.
- [ ] Test expired tokens.
- [ ] Test Google OAuth.
- [ ] Test forgot password.
- [ ] Test password reset.
- [ ] Test change password.
- [ ] Test account deletion.
- [ ] Test profile and preference persistence, including USD as the default currency.
- [ ] Verify email changes and multi-currency conversion are not exposed.
- [ ] Test protected routes.
- [ ] Test cross-user access prevention.
- [ ] Run lint, typecheck, and build.

### Phase 5 Acceptance Criteria

- Email/password authentication works.
- Google OAuth works.
- Secure HTTP-only cookie sessions work.
- Password reset works.
- Protected routes and ownership checks work.
- Email cannot be changed by the user.
- No email verification is required.
- Profile, security, and preference settings follow the PRD; USD remains the default currency and currency conversion is excluded.

---

# Phase 6 — Core CRM Modules

**Status:** Not Started

## Milestone 6.1 — Contacts Module

### Backend

- [ ] Implement Contact create endpoint.
- [ ] Implement Contact list endpoint.
- [ ] Implement Contact details endpoint.
- [ ] Implement Contact update endpoint.
- [ ] Implement Contact delete endpoint.
- [ ] Implement search.
- [ ] Implement filters.
- [ ] Implement sorting.
- [ ] Implement pagination.
- [ ] Implement bulk actions.
- [ ] Implement Contact statistics.
- [ ] Implement related Deals retrieval.
- [ ] Implement related Tasks retrieval.
- [ ] Implement Contact Activities retrieval.
- [ ] Enforce ownership and validation.

### Frontend

- [ ] Create Contacts list page.
- [ ] Implement table view.
- [ ] Implement grid view.
- [ ] Implement search.
- [ ] Implement filters.
- [ ] Implement sorting.
- [ ] Implement pagination.
- [ ] Implement row selection.
- [ ] Implement bulk actions.
- [ ] Implement Add Contact side sheet.
- [ ] Implement Edit Contact side sheet.
- [ ] Implement Delete confirmation.
- [ ] Implement Contact details page.
- [ ] Implement Overview tab.
- [ ] Implement Deals tab.
- [ ] Implement Tasks & Follow-ups tab.
- [ ] Implement Activity Timeline.
- [ ] Implement loading states.
- [ ] Implement empty states.
- [ ] Implement error states.
- [ ] Implement success feedback.
- [ ] Validate responsive behavior.

### Contact Fields & Rules

- [ ] First Name (required).
- [ ] Last Name (required).
- [ ] Email.
- [ ] Phone.
- [ ] Company.
- [ ] Contact Type: Lead, Client, Former Client, Partner.
- [ ] Job Title.
- [ ] Tags.
- [ ] Website.
- [ ] Notes.
- [ ] Support zero or one Company.
- [ ] Support multiple Deals per Contact.
- [ ] Support searchable Company selection.

### Contact List Behavior

- [ ] Show avatar/name/email.
- [ ] Show Company.
- [ ] Show Contact Type.
- [ ] Show Deals count.
- [ ] Show Last Activity.
- [ ] Show Added date.
- [ ] Show row actions.
- [ ] Filter by Type.
- [ ] Filter by Company.
- [ ] Filter by Tags.
- [ ] Filter by Date Added.
- [ ] Sort by Name.
- [ ] Sort by Recently Added.
- [ ] Sort by Last Activity.

### Contact Deletion Rules

- [ ] Delete Contact.
- [ ] Delete related Tasks and Follow-ups.
- [ ] Delete related Activities.
- [ ] Retain related Deals.
- [ ] Set deleted Contact as null on retained Deals.
- [ ] Retain Deal History.

## Milestone 6.2 — Companies Module

### Backend

- [ ] Implement Company create endpoint.
- [ ] Implement Company list endpoint.
- [ ] Implement Company details endpoint.
- [ ] Implement Company update endpoint.
- [ ] Implement Company delete endpoint.
- [ ] Implement search.
- [ ] Implement filters.
- [ ] Implement sorting.
- [ ] Implement pagination.
- [ ] Implement bulk actions.
- [ ] Implement Company statistics.
- [ ] Implement related Contacts retrieval.
- [ ] Implement related Deals retrieval.
- [ ] Implement related Activities retrieval.
- [ ] Implement logo upload integration.

### Frontend

- [ ] Create Companies list page.
- [ ] Implement table view.
- [ ] Implement grid view.
- [ ] Implement search.
- [ ] Implement filters.
- [ ] Implement sorting.
- [ ] Implement pagination.
- [ ] Implement row selection.
- [ ] Implement bulk delete.
- [ ] Implement export selected.
- [ ] Implement Add Company side sheet.
- [ ] Implement Edit Company side sheet.
- [ ] Implement Delete confirmation.
- [ ] Implement Company details page.
- [ ] Implement Overview tab.
- [ ] Implement Contacts tab.
- [ ] Implement Deals tab.
- [ ] Implement Activities tab.
- [ ] Implement Notes through Activity records.
- [ ] Implement loading, empty, error, and success states.

### Company Fields & Rules

- [ ] Company Name (required).
- [ ] Website.
- [ ] Industry.
- [ ] Email.
- [ ] Phone.
- [ ] Address.
- [ ] Description.
- [ ] Company Size.
- [ ] Annual Revenue (numeric USD).
- [ ] LinkedIn URL.
- [ ] Logo upload.
- [ ] Generate fallback avatar using first two letters.
- [ ] Show duplicate-name warning but allow duplicates.
- [ ] Industry options follow the PRD.
- [ ] Company Size options follow the PRD.

### Company Statistics & List

- [ ] Total Companies.
- [ ] Total Contacts.
- [ ] Active Deals.
- [ ] Total Deal Value.
- [ ] Show company logo/name.
- [ ] Show Industry.
- [ ] Show Size.
- [ ] Show Contacts count.
- [ ] Show Active Deals.
- [ ] Show Total Deal Value.
- [ ] Show Added date.
- [ ] Filter by Industry.
- [ ] Filter by Size.
- [ ] Filter by Number of Contacts.
- [ ] Filter by Date Added.
- [ ] Sort by Name.
- [ ] Sort by Recently Added.
- [ ] Sort by Deal Value.

### Company Details Rules

- [ ] Contacts tab uses a table.
- [ ] Add Contact from Company automatically links the Company.
- [ ] Company Activities include related Contact and Deal activities.
- [ ] Display source labels in aggregated timelines.
- [ ] Notes are Activity records of type Note.
- [ ] Avoid creating a separate Notes entity.

### Company Deletion Rules

- [ ] Delete Company only.
- [ ] Retain its Contacts.
- [ ] Set their Company reference to null.
- [ ] Retain related Deals.
- [ ] Set their Company reference to null.
- [ ] Preserve historical Activities.
- [ ] Preserve Deal History.

## Milestone 6.3 — Pipeline Stages Module

### Backend

- [ ] Create default stages.
- [ ] Implement stage listing.
- [ ] Implement stage creation.
- [ ] Implement stage renaming.
- [ ] Implement stage reordering.
- [ ] Implement stage color updates.
- [ ] Implement stage deletion.
- [ ] Require replacement stage when deleting a stage with Deals.
- [ ] Reassign affected Deals before deletion.
- [ ] Prevent deletion without valid reassignment.
- [ ] Enforce ownership.

### Frontend

- [ ] Implement pipeline stage settings.
- [ ] Implement add stage.
- [ ] Implement rename stage.
- [ ] Implement reorder stages.
- [ ] Implement color selection.
- [ ] Implement delete stage confirmation.
- [ ] Implement replacement-stage selection.
- [ ] Display default stages.

### Stage Rules

- [ ] Default stages: New, Qualified, Proposal, Negotiation.
- [ ] Won and Lost are terminal statuses, not ordinary stages.
- [ ] Users can add, rename, reorder, recolor, and delete ordinary stages.
- [ ] Deleting a stage with Deals requires reassignment.

## Milestone 6.4 — Deals Module

### Backend

- [ ] Implement Deal creation.
- [ ] Implement Deal listing.
- [ ] Implement Deal details.
- [ ] Implement Deal update.
- [ ] Implement Deal deletion.
- [ ] Implement Deal search.
- [ ] Implement filters.
- [ ] Implement sorting.
- [ ] Implement pagination.
- [ ] Implement bulk actions.
- [ ] Implement Deal statistics.
- [ ] Implement stage changes.
- [ ] Implement Won transition.
- [ ] Implement Lost transition.
- [ ] Implement reopening.
- [ ] Implement Deal History creation.
- [ ] Implement Deal timeline retrieval.
- [ ] Implement related Tasks retrieval.
- [ ] Enforce ownership.

### Frontend — Deal Views

- [ ] Create Deals page.
- [ ] Implement Kanban view.
- [ ] Implement Table view.
- [ ] Implement view toggle.
- [ ] Implement drag-and-drop between stages.
- [ ] Implement stage headers.
- [ ] Show Deal count per stage.
- [ ] Show total value per stage.
- [ ] Implement add Deal action per stage.
- [ ] Implement Deal cards.
- [ ] Implement search.
- [ ] Implement filters.
- [ ] Implement sorting.
- [ ] Implement pagination where appropriate.
- [ ] Implement row selection.
- [ ] Implement bulk Delete Selected.
- [ ] Implement bulk Change Stage.
- [ ] Implement bulk Export Selected.

### Deal Cards

- [ ] Deal Name.
- [ ] Contact Name.
- [ ] Company.
- [ ] Deal Value.
- [ ] Probability.
- [ ] Expected Closing Date.

### Deal Statistics

- [ ] Total Deals.
- [ ] Active Deals.
- [ ] Pipeline Value.
- [ ] Won Revenue.
- [ ] Lost Deals.

### Deal Fields & Forms

- [ ] Deal Name (required).
- [ ] Deal Value (required and greater than zero).
- [ ] Primary Contact (required on creation).
- [ ] Company (optional).
- [ ] Pipeline Stage (required).
- [ ] Probability (optional, default based on stage).
- [ ] Allow manual probability override.
- [ ] Expected Closing Date (optional).
- [ ] Description (optional).
- [ ] Implement searchable Contact Select.
- [ ] Support Add Contact from Contact Select.
- [ ] Auto-populate Company from selected Contact.
- [ ] Allow user to change the selected Company.
- [ ] Allow Deal Company to differ from Contact Company.

### Deal Details

- [ ] Create Deal details page.
- [ ] Show Overview.
- [ ] Show Primary Contact.
- [ ] Show Company.
- [ ] Show Value and Probability.
- [ ] Show Stage.
- [ ] Show Expected Closing Date.
- [ ] Show Description.
- [ ] Show Timeline.
- [ ] Show Related Tasks.
- [ ] Show Deal History.
- [ ] Include Deal activities in timeline.
- [ ] Include Primary Contact activities in timeline.
- [ ] Display source labels.

### Deal Status & History Rules

- [ ] Record Deal creation in history.
- [ ] Record stage changes.
- [ ] Record value updates.
- [ ] Record Won transition.
- [ ] Record Lost transition.
- [ ] Record reopening.
- [ ] Confirm before marking Won.
- [ ] Confirm before marking Lost.
- [ ] Lost Reason is optional.
- [ ] Lost Reason options follow the PRD.
- [ ] Won records Actual Closing Date.
- [ ] Won records Final Deal Value.
- [ ] Lost records Lost Date.
- [ ] Closed Won value cannot be edited unless reopened.
- [ ] Reopening returns to the last ordinary stage.
- [ ] Preserve Deal History if Contact is deleted.
- [ ] Preserve Deal if Company is deleted.

## Milestone 6.5 — Tasks & Follow-ups Module

### Backend

- [ ] Implement Task creation.
- [ ] Implement Task listing.
- [ ] Implement Task details.
- [ ] Implement Task update.
- [ ] Implement Task deletion.
- [ ] Implement Task status changes.
- [ ] Implement Task completion timestamp.
- [ ] Implement Task filters.
- [ ] Implement Task sorting.
- [ ] Implement Task pagination.
- [ ] Implement bulk actions.
- [ ] Implement related entity validation.
- [ ] Implement reminder scheduling support.
- [ ] Enforce ownership.

### Frontend

- [ ] Create Tasks page.
- [ ] Implement task list/table.
- [ ] Implement status filters.
- [ ] Implement priority filters.
- [ ] Implement type filters.
- [ ] Implement due-date filters.
- [ ] Implement related entity filters.
- [ ] Implement sorting.
- [ ] Implement bulk Complete.
- [ ] Implement bulk Delete.
- [ ] Implement bulk Change Priority.
- [ ] Implement Add Task form.
- [ ] Implement Edit Task form.
- [ ] Implement Task Details side sheet.
- [ ] Implement completion action.
- [ ] Implement overdue styling.
- [ ] Implement loading, empty, error, and success states.

### Task Fields & Rules

- [ ] Title.
- [ ] Description.
- [ ] Type: Task or Follow-up.
- [ ] Status: To Do, In Progress, Completed, Cancelled.
- [ ] Priority: Low, Medium, High.
- [ ] Optional Due Date.
- [ ] Optional Due Time.
- [ ] Optional related Contact, Deal, or Company.
- [ ] A Task can relate to only one entity.
- [ ] Reminder one day before Due Date.
- [ ] No reminder without Due Date.
- [ ] Record completion timestamp.
- [ ] Recurring Tasks remain deferred.
- [ ] Calls and Meetings are Activities, not Task types.

## Milestone 6.6 — Activities Module

### Backend

- [ ] Implement Activity creation.
- [ ] Implement Activity listing.
- [ ] Implement Activity details.
- [ ] Implement Activity update.
- [ ] Implement Activity deletion.
- [ ] Implement Activity filtering.
- [ ] Implement timeline aggregation.
- [ ] Prevent duplicate underlying records in aggregated timelines.
- [ ] Enforce ownership.

### Frontend

- [ ] Implement Activity creation from Contact.
- [ ] Implement Activity creation from Company.
- [ ] Implement Activity creation from Deal.
- [ ] Implement Activity editing.
- [ ] Implement Activity deletion.
- [ ] Implement Activity timeline component.
- [ ] Display activity type.
- [ ] Display activity date.
- [ ] Display related entity.
- [ ] Display source labels for aggregated activities.

### Activity Rules

- [ ] Support Note.
- [ ] Support Call.
- [ ] Support Email.
- [ ] Support Meeting.
- [ ] Support title.
- [ ] Support description/content.
- [ ] Support related Contact, Deal, or Company.
- [ ] Support Activity Date.
- [ ] Support scheduled date/time where applicable.
- [ ] Contact deletion cascades its related Activities.
- [ ] Company deletion preserves historical Activities.
- [ ] Deal History remains separate from Contact Activities.

## Milestone 6.7 — Core CRM Integration & Validation

- [ ] Verify Contact–Company relationships.
- [ ] Verify Contact–Deal relationships.
- [ ] Verify Company–Deal relationships.
- [ ] Verify Task relationships.
- [ ] Verify Activity aggregation.
- [ ] Verify deletion rules.
- [ ] Verify ownership across all modules.
- [ ] Verify all list pages.
- [ ] Verify all details pages.
- [ ] Verify all forms.
- [ ] Verify all empty/loading/error states.
- [ ] Verify responsive behavior.
- [ ] Run lint.
- [ ] Run typecheck.
- [ ] Run production build.
- [ ] Run relevant automated tests.
- [ ] Update documentation.

### Phase 6 Acceptance Criteria

- All core CRM modules work end-to-end.
- CRUD operations are connected to MongoDB.
- Search, filters, sorting, and pagination work where required.
- Relationships and deletion rules follow the PRD.
- Every operation is owner-scoped.
- All required UI states are implemented.

---

# Phase 7 — Calendar & Notifications

**Status:** Not Started

## Milestone 7.1 — Calendar Backend Support

- [ ] Implement calendar event retrieval.
- [ ] Retrieve Tasks.
- [ ] Retrieve Follow-ups.
- [ ] Retrieve Meetings.
- [ ] Retrieve Calls.
- [ ] Support date-range filtering.
- [ ] Support owner-scoped results.
- [ ] Implement supported event rescheduling.
- [ ] Validate event update permissions.

## Milestone 7.2 — Calendar Frontend

- [ ] Create Calendar page.
- [ ] Implement Monthly view.
- [ ] Implement Weekly view.
- [ ] Implement Daily view.
- [ ] Set Monday as first day of week.
- [ ] Display Tasks.
- [ ] Display Follow-ups.
- [ ] Display Meetings.
- [ ] Display Calls.
- [ ] Use distinct event colors.
- [ ] Open event details.
- [ ] Implement event navigation.
- [ ] Create Task from selected date.
- [ ] Create Follow-up from selected date.
- [ ] Support drag-and-drop rescheduling where applicable.
- [ ] Verify responsive calendar behavior.

## Milestone 7.3 — Notifications Backend

- [ ] Implement notification creation.
- [ ] Implement notification listing.
- [ ] Implement unread count.
- [ ] Implement mark as read.
- [ ] Implement mark as unread where required.
- [ ] Implement mark all as read.
- [ ] Implement owner-scoped notifications.
- [ ] Add notification indexes.
- [ ] Implement reminder generation.
- [ ] Handle duplicate reminder prevention.

## Milestone 7.4 — Notification Events

- [ ] Task reminders.
- [ ] Overdue Tasks.
- [ ] Upcoming Follow-ups.
- [ ] Deal marked Won.
- [ ] Deal marked Lost.
- [ ] Approaching Deal closing date.

## Milestone 7.5 — Notifications Frontend

- [ ] Implement notification bell.
- [ ] Implement unread badge.
- [ ] Implement notification dropdown.
- [ ] Implement notifications page.
- [ ] Implement notification list.
- [ ] Implement read/unread behavior.
- [ ] Implement mark all as read.
- [ ] Implement notification navigation.
- [ ] Implement empty state.
- [ ] Implement loading and error states.

## Milestone 7.6 — Validation

- [ ] Verify calendar date calculations.
- [ ] Verify Monday-first behavior.
- [ ] Verify event types and colors.
- [ ] Verify event details.
- [ ] Verify rescheduling.
- [ ] Verify reminder timing.
- [ ] Verify notification ownership.
- [ ] Verify unread counts.
- [ ] Verify duplicate prevention.
- [ ] Run lint, typecheck, build, and tests.

### Phase 7 Acceptance Criteria

- Monthly, Weekly, and Daily calendar views work.
- All required event types appear.
- Supported events can be rescheduled.
- In-app notifications work.
- Reminders and notification rules follow the PRD.

---

# Phase 8 — Dashboard, Global Search & Data Export

**Status:** Not Started

## Milestone 8.1 — Dashboard Backend

- [ ] Implement dashboard summary endpoint.
- [ ] Implement Total Contacts metric.
- [ ] Implement Active Deals metric.
- [ ] Implement Total Pipeline Value metric.
- [ ] Implement Won Deals metric.
- [ ] Implement revenue-over-time data.
- [ ] Implement deals-by-stage data.
- [ ] Implement contact-growth data.
- [ ] Implement deal-conversion data.
- [ ] Implement Pipeline Overview data.
- [ ] Implement Recent Deals data.
- [ ] Implement Recent Contacts data.
- [ ] Implement Recent Activities data.
- [ ] Implement Upcoming Tasks data.
- [ ] Support last 90 days analytics.
- [ ] Enforce owner-scoped aggregation.

## Milestone 8.2 — Dashboard Frontend

- [ ] Create Dashboard page.
- [ ] Implement welcome section.
- [ ] Implement quick action: Create Contact.
- [ ] Implement quick action: Create Deal.
- [ ] Implement quick action: Create Task.
- [ ] Implement KPI cards.
- [ ] Implement revenue-over-time chart.
- [ ] Implement deals-by-stage chart.
- [ ] Implement contact-growth chart.
- [ ] Implement deal-conversion chart.
- [ ] Implement Pipeline Overview.
- [ ] Implement Recent Deals.
- [ ] Implement Recent Contacts.
- [ ] Implement Recent Activities.
- [ ] Implement Upcoming Tasks.
- [ ] Implement chart loading states.
- [ ] Implement empty chart states.
- [ ] Implement responsive dashboard layout.
- [ ] Use Hairline Charts where appropriate.

## Milestone 8.3 — Global Search Backend

- [ ] Implement global search endpoint.
- [ ] Search Contacts.
- [ ] Search Companies.
- [ ] Search Deals.
- [ ] Search Tasks.
- [ ] Group results by entity type.
- [ ] Enforce ownership.
- [ ] Implement sensible result limits.
- [ ] Support empty and invalid queries.

## Milestone 8.4 — Global Search Frontend

- [ ] Implement global search dialog.
- [ ] Support Ctrl+K shortcut.
- [ ] Implement search input.
- [ ] Implement grouped results.
- [ ] Implement keyboard navigation.
- [ ] Implement result selection.
- [ ] Navigate to the corresponding record.
- [ ] Implement loading state.
- [ ] Implement empty state.
- [ ] Implement no-results state.
- [ ] Implement error state.

## Milestone 8.5 — CSV Export

- [ ] Implement Contacts CSV export.
- [ ] Implement Companies CSV export.
- [ ] Implement Deals CSV export.
- [ ] Implement Tasks CSV export.
- [ ] Support export selected records.
- [ ] Support export filtered records.
- [ ] Respect user ownership.
- [ ] Escape CSV values correctly.
- [ ] Handle special characters.
- [ ] Provide frontend download actions.
- [ ] Validate exported data.

### Deferred

- CSV Import is deferred to V1.1.

### Phase 8 Acceptance Criteria

- Dashboard metrics and analytics are accurate.
- Dashboard data is scoped to the authenticated user.
- Global search works across all required entity types.
- Ctrl+K opens search.
- CSV export works for selected and filtered records.

---

# Phase 9 — Landing Page & Onboarding

**Status:** Not Started

## Milestone 9.1 — Public Website Foundation

- [ ] Establish public website layout.
- [ ] Establish responsive navigation.
- [ ] Establish public footer.
- [ ] Add Login navigation.
- [ ] Add Register/Get Started navigation.
- [ ] Apply Relio design system.
- [ ] Verify responsive behavior.

## Milestone 9.2 — Landing Page Sections

- [ ] Hero.
- [ ] Social Proof.
- [ ] The Problem.
- [ ] Everything in One Place.
- [ ] Client Management.
- [ ] Deal Pipeline.
- [ ] Never Miss a Follow-up.
- [ ] Business Insights.
- [ ] How It Works.
- [ ] Testimonials.
- [ ] Pricing.
- [ ] FAQ.
- [ ] Final CTA.

## Milestone 9.3 — Landing Page Content & Visuals

- [ ] Write product-focused copy.
- [ ] Use consistent brand voice.
- [ ] Use Hairline SVG illustrations where appropriate.
- [ ] Use appropriate product screenshots.
- [ ] Optimize image sizes.
- [ ] Avoid fabricated testimonials.
- [ ] Avoid fabricated business metrics.
- [ ] Clearly label illustrative/demo data.
- [ ] Add relevant metadata.
- [ ] Add social sharing metadata.
- [ ] Verify accessibility.
- [ ] Verify responsive behavior.

## Milestone 9.4 — Onboarding

- [ ] Define onboarding flow.
- [ ] Implement welcome screen.
- [ ] Implement product introduction.
- [ ] Implement feature walkthrough.
- [ ] Make onboarding skippable.
- [ ] Allow optional demo data.
- [ ] Allow demo data removal.
- [ ] Persist onboarding completion.
- [ ] Avoid forcing unnecessary setup steps.

### Phase 9 Acceptance Criteria

- Public landing page is complete and responsive.
- All required sections are implemented.
- Content is accurate and does not fabricate proof.
- Onboarding is optional and skippable.

---

# Phase 10 — Quality Assurance & Production Deployment

**Status:** Not Started

## Milestone 10.1 — Frontend Quality Assurance

- [ ] Review all frontend routes.
- [ ] Review all forms.
- [ ] Review all validation.
- [ ] Review all loading states.
- [ ] Review all empty states.
- [ ] Review all error states.
- [ ] Review all success states.
- [ ] Review responsive behavior.
- [ ] Review accessibility.
- [ ] Review keyboard navigation.
- [ ] Review theme behavior.
- [ ] Review browser console errors.
- [ ] Review performance.
- [ ] Review unnecessary re-renders.
- [ ] Review asset loading.

## Milestone 10.2 — Backend Quality Assurance

- [ ] Review all API endpoints.
- [ ] Review all request validation.
- [ ] Review error handling.
- [ ] Review authentication.
- [ ] Review authorization.
- [ ] Review ownership checks.
- [ ] Review data relationships.
- [ ] Review deletion rules.
- [ ] Review database indexes.
- [ ] Review security headers.
- [ ] Review rate limiting.
- [ ] Review logging.
- [ ] Review environment validation.
- [ ] Review file upload security.

## Milestone 10.3 — Automated Testing

- [ ] Add or complete unit tests.
- [ ] Add or complete service tests.
- [ ] Add API integration tests.
- [ ] Add authentication tests.
- [ ] Add authorization tests.
- [ ] Add business-rule tests.
- [ ] Add database relationship tests.
- [ ] Add deletion-behavior tests.
- [ ] Add frontend component tests where useful.
- [ ] Add end-to-end critical flow tests.
- [ ] Test registration and login.
- [ ] Test Contact CRUD.
- [ ] Test Company CRUD.
- [ ] Test Deal lifecycle.
- [ ] Test Task lifecycle.
- [ ] Test Activity creation.
- [ ] Test calendar flows.
- [ ] Test notifications.
- [ ] Test global search.
- [ ] Test CSV exports.

## Milestone 10.4 — Security Review

- [ ] Verify secrets are not committed.
- [ ] Verify production environment variables.
- [ ] Verify secure cookies.
- [ ] Verify CORS allowlist.
- [ ] Verify JWT configuration.
- [ ] Verify password hashing.
- [ ] Verify password reset security.
- [ ] Verify rate limiting.
- [ ] Verify ownership and access control.
- [ ] Verify file upload validation.
- [ ] Verify input validation.
- [ ] Verify sensitive error information is not exposed.
- [ ] Review dependencies for known vulnerabilities.

## Milestone 10.5 — Performance & Accessibility

- [ ] Optimize frontend production bundle.
- [ ] Optimize images and assets.
- [ ] Review lazy loading.
- [ ] Review API response performance.
- [ ] Review database query performance.
- [ ] Review indexes.
- [ ] Review accessibility.
- [ ] Review color contrast.
- [ ] Review screen-reader semantics.
- [ ] Review keyboard interaction.
- [ ] Review reduced-motion behavior.

## Milestone 10.6 — Production Configuration

- [ ] Configure production frontend environment.
- [ ] Configure production backend environment.
- [ ] Configure MongoDB Atlas production access.
- [ ] Configure frontend/backend URLs.
- [ ] Configure production CORS.
- [ ] Configure production cookie settings.
- [ ] Configure Google OAuth production URLs.
- [ ] Configure password reset email settings.
- [ ] Configure image storage.
- [ ] Configure logging.
- [ ] Configure health checks.
- [ ] Configure deployment build commands.
- [ ] Configure deployment start commands.
- [ ] Verify monorepo deployment configuration.

## Milestone 10.7 — Deployment & Smoke Tests

- [ ] Deploy frontend.
- [ ] Deploy backend.
- [ ] Verify frontend loads.
- [ ] Verify backend health endpoint.
- [ ] Verify database connection.
- [ ] Verify registration.
- [ ] Verify login.
- [ ] Verify session persistence.
- [ ] Verify core CRM operations.
- [ ] Verify file uploads.
- [ ] Verify password reset.
- [ ] Verify Google OAuth.
- [ ] Verify production cookies.
- [ ] Verify CORS.
- [ ] Verify critical user journeys.
- [ ] Configure database backup/recovery strategy.
- [ ] Document deployment process.

## Milestone 10.8 — Final Release

- [ ] Resolve all blocking issues.
- [ ] Run full lint.
- [ ] Run full typecheck.
- [ ] Run full production build.
- [ ] Run required automated tests.
- [ ] Verify production smoke tests.
- [ ] Update README.
- [ ] Update environment documentation.
- [ ] Update architecture documentation.
- [ ] Update progress documentation.
- [ ] Mark Phase 10 Completed.
- [ ] Mark MVP release as complete.

### MVP Definition of Done

- All required MVP features are implemented.
- UI is responsive.
- Frontend and backend validation are implemented.
- API and database integration work.
- User ownership is enforced.
- All business rules follow the PRD.
- Critical user journeys are tested.
- TypeScript checks pass.
- Lint passes.
- Production build passes.
- No unresolved blocking issues remain.
- Production deployment is verified.

---

# Future Versions — Explicitly Deferred

These items are not part of the initial MVP unless the PRD is formally changed.

## MVP Out of Scope

The PRD explicitly defers the following. They are not assigned a release unless noted in the future-version lists below:

- Email account integration and automated email sending.
- AI-powered Client Insights.
- External calendar synchronization.
- Subscription and billing.
- Recurring Tasks (V1.1).
- External push notifications and automated email notifications.
- CSV Import (V1.1).
- Team collaboration.
- Multiple workspaces.

## V1.1

- [ ] Recurring Tasks.
- [ ] CSV Import.
- [ ] More Advanced Analytics.
- [ ] Additional Custom Fields.
- [ ] More Advanced Pipeline Configuration.

## V1.2

- [ ] Email Integration.
- [ ] Automated Email Reminders.
- [ ] Google Calendar Synchronization.
- [ ] External Notifications.

## V2

- [ ] AI-powered Client Insights.
- [ ] Automated Workflow Suggestions.
- [ ] Subscription and Billing.
- [ ] Additional Productivity Integrations.

---

# 3. Milestone Execution Rules

For every milestone:

1. Read the relevant PRD requirements.
2. Read the current roadmap phase.
3. Read the current architecture decisions.
4. Inspect the existing code before implementation.
5. Identify already completed tasks.
6. Present a concise implementation plan.
7. Implement incrementally.
8. Validate each logical group of changes.
9. Run relevant tests, lint, typecheck, and build.
10. Fix errors introduced by the implementation.
11. Update this file immediately after the milestone is completed.
12. Record relevant files, modules, validation results, and known issues.

## Task Status Rules

- Mark a task `[x]` only after implementation and appropriate validation.
- Keep incomplete tasks `[ ]`.
- Never mark a whole milestone Completed while required tasks remain incomplete.
- If a task is blocked, document the reason.
- If a task is deferred, document where and why.
- If a task is no longer required, document the reason instead of silently deleting it.

## Scope Change Rules

- Do not change product requirements independently.
- Do not remove or rewrite existing requirements to simplify implementation.
- Do not silently change business rules.
- If a requirement appears technically impossible or conflicts with another requirement, report the conflict and propose options.
- Obtain approval before changing the PRD.
- Add approved scope changes to the PRD and update the roadmap/progress accordingly.

## Documentation Synchronization

After each milestone:
- Update `PROGRESS.md`.

After completing a phase:
- Update the phase status in `ROADMAP.md`.
- Update the phase summary in `PROGRESS.md`.

After an actual architectural change:
- Update `ARCHITECTURE.md`.
- Record the decision, reason, alternatives considered, and impact when relevant.

Do not update documents with fictional or unverified implementation status.

---

# 4. Current Next Action

**Current Phase:** Phase 3 — Backend Infrastructure & API Foundation (In Progress).

**Next Milestone:** Milestone 3.7 — Backend Validation.

Milestones 3.1–3.6 are complete. Validate the backend foundation in Milestone 3.7, then stop before starting Phase 4 until the user instructs you to continue.
