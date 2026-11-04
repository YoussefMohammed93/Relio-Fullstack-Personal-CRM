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
| Current Phase | Phase 6 — Core CRM Modules (In Progress) |
| Next Milestone | Phase 6 — Milestone 6.6 Activities |
| Last Updated | 2026-11-04 |

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
| 3 | Backend Infrastructure & API Foundation | Completed |
| 4 | Database Architecture & Data Modeling | Completed |
| 5 | Authentication & User Management | In Progress |
| 6 | Core CRM Modules | In Progress |
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
- [x] Establish filtering conventions.
- [x] Establish sorting conventions.
- [x] Establish request validation conventions.
- [x] Establish controller/service responsibilities.

### Milestone 3.3 API Standards Record

- Added shared response helpers for API payload envelopes and pagination metadata to keep backend responses consistent across routes.
- Added request validation middleware built on Zod so incoming body, query, and params payloads can be validated before controller logic runs.
- Updated the health route and global error handler to use the shared success/error response contract.
- Defined per-endpoint query schemas and allowlists for filters and sort fields, literal configured-field search, server-injected ownership filters, and module-owned defaults. Shared query builders now require filter/sort allowlists, omit unsupported or nested values, escape search text, and reject unsupported sort fields.
- Documented that routes compose middleware, controllers map validated HTTP input/output, and services own business rules, ownership, query construction, and module data access. These are conventions for future CRM modules; no CRM module was created.
- Validation: the server test suite passed (13 tests), `pnpm lint` passed with 0 errors and 12 existing client warnings, `pnpm typecheck` passed, `pnpm build` passed, and `pnpm format:check` passed.
- Files changed: `apps/server/src/shared/query.ts`, `apps/server/src/shared/query.test.ts`, `docs/ARCHITECTURE.md`, and this record.

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

- [x] Verify health endpoint.
- [x] Verify database connectivity.
- [x] Verify environment validation.
- [x] Verify error handling.
- [x] Verify security middleware.
- [x] Run lint.
- [x] Run typecheck.
- [x] Run production build.
- [x] Update project documentation.

### Milestone 3.7 Backend Validation Record

- MongoDB Atlas connected successfully through the server's configured DNS resolvers. The server now requires a configured URI and waits for a successful database connection before opening its HTTP listener; missing or invalid connection configuration exits without listening.
- HTTP smoke checks passed for the health response and database state, standardized 404 error envelope, production error-detail redaction, CORS origin, Helmet `X-Content-Type-Options`, request ID, and disabled `X-Powered-By` header.
- Environment validation rejected `PORT=0` as expected.
- `pnpm --filter @relio/server exec node --import tsx --test src/shared/api.test.ts src/shared/query.test.ts src/shared/validation.test.ts src/modules/uploads/company-logo.test.ts` — 12 tests passed.
- `pnpm format:check` — passed.
- `pnpm lint` — passed with 0 errors and 12 existing client warnings.
- `pnpm typecheck` — passed for all workspace packages.
- `pnpm build` — passed for all workspace packages.
- Files changed: `apps/server/src/server.ts`, `apps/server/src/database/connect.ts`, seven backend files formatted by Prettier, and this progress record. `docs/ARCHITECTURE.md` records the verified startup behavior and decision.

Milestone 3.3 is complete. Phase 3 is complete after secure rotation and validation of the previously exposed database/JWT credentials documented under Milestone 3.6. Phase 4 begins with Milestone 4.1 and the initial model design work.

### Phase 3 Acceptance Criteria

- Backend infrastructure is production-oriented.
- MongoDB connection works.
- API conventions are consistent.
- Security middleware is configured.
- Reusable backend utilities are available.
- Existing Phase 1 infrastructure has been reused rather than duplicated.

---

# Phase 4 — Database Architecture & Data Modeling

**Status:** In Progress

## Milestone 4.1 — Data Model Design

- [x] Review PRD data requirements.
- [x] Define User model.
- [x] Define Contact model.
- [x] Define Company model.
- [x] Define PipelineStage model.
- [x] Define Deal model.
- [x] Define Task model.
- [x] Define Activity model.
- [x] Define DealHistory model.
- [x] Define Notification model.
- [x] Define relationships and references.
- [x] Define required and optional fields.
- [x] Define timestamps.
- [x] Define ownership rules.
- [x] Define deletion behavior.
- [x] Review model design against all PRD business rules.

### Milestone 4.1 Implementation Record

- Added Mongoose schemas for the primary Relio domain models under `apps/server/src/database/models/` and exported them via `apps/server/src/database/models/index.ts`.
- Validated the model contract with `src/database/models.test.ts` before completion, including unique user identity constraints and owner references for user-owned records.
- Model coverage includes `User`, `Contact`, `Company`, `PipelineStage`, `Deal`, `Task`, `Activity`, `DealHistory`, and `Notification` with the PRD-aligned relationships and timestamps needed for Phase 5 authentication and CRM work.
- Verification: `pnpm --filter @relio/server exec node --import tsx --test src/shared/api.test.ts src/shared/query.test.ts src/shared/validation.test.ts src/database/models.test.ts` — 12/12 tests passed; `pnpm --filter @relio/server typecheck` — passed; `pnpm --filter @relio/server build` — passed.

## Milestone 4.2 — User Model

- [x] Define username.
- [x] Define email.
- [x] Define password storage.
- [x] Define Google account information where needed.
- [x] Define profile fields.
- [x] Define default avatar behavior.
- [x] Define timestamps.
- [x] Add required indexes.
- [x] Enforce email uniqueness.

### Milestone 4.2 Implementation Record

- Completed the `User` schema in `apps/server/src/database/models/user.ts` with the username/email identity rules, password hashing storage, profile fields, theme preference defaults, and OAuth-friendly Google account metadata that the PRD requires.
- Added the contract verification in `apps/server/src/database/models.test.ts` to cover required profile defaults, password storage defaults, unique login identity, and ownerless identity behavior.
- This milestone closes the User identity foundation needed before the Contact, Company, and Deal models are built in later Phase 4 steps.
- Verification: `pnpm --filter @relio/server exec node --import tsx --test src/database/models.test.ts` — 3/3 tests passed.

## Milestone 4.3 — Contact Model

- [x] Define first name.
- [x] Define last name.
- [x] Define email.
- [x] Define phone.
- [x] Define optional Company reference.
- [x] Define Contact Type.
- [x] Define job title.
- [x] Define tags.
- [x] Define website.
- [x] Define notes.
- [x] Define owner reference.
- [x] Define timestamps.
- [x] Add appropriate indexes.

### Milestone 4.3 Implementation Record

- Completed the `Contact` schema in `apps/server/src/database/models/contact.ts` to match the PRD: required first/last name, job title, company relationship, contact types (`lead`, `client`, `former_client`, `partner`), tags, notes, and owner-scoped uniqueness/indexing.
- Added contract checks in `apps/server/src/database/models.test.ts` for the required fields, enum values, and owner/company relationships.
- Verification: `pnpm --filter @relio/server exec node --import tsx --test src/database/models.test.ts` — 4/4 tests passed.

## Milestone 4.4 — Company Model

- [x] Define company name.
- [x] Define website.
- [x] Define industry.
- [x] Define email.
- [x] Define phone.
- [x] Define address.
- [x] Define description.
- [x] Define company size.
- [x] Define annual revenue.
- [x] Define LinkedIn URL.
- [x] Define logo.
- [x] Define owner reference.
- [x] Define timestamps.
- [x] Add appropriate indexes.

### Milestone 4.4 Implementation Record

- Completed the `Company` schema in `apps/server/src/database/models/company.ts` to match the PRD company object: required company name, owner reference, optional business details, embedded address block, logo URL, tags, and revenue metadata.
- Kept the schema owner-scoped and unique per user by company name to support the PRD’s company/contact relationship rules.
- Added the contract check in `apps/server/src/database/models.test.ts` for field presence, field types, and embedded address behavior.
- Verification: `pnpm --filter @relio/server exec node --import tsx --test src/database/models.test.ts` — 5/5 tests passed.

## Milestone 4.5 — Pipeline Stage Model

- [x] Define stage name.
- [x] Define stage color.
- [x] Define stage order.
- [x] Define default stages.
- [x] Define owner reference.
- [x] Define timestamps.
- [x] Define terminal Deal statuses separately from ordinary stages.
- [x] Add appropriate indexes.

### Milestone 4.5 Implementation Record

- Completed `PipelineStage` in `apps/server/src/database/models/pipeline-stage.ts` with an owner reference, required trimmed name, validated six-digit hex color, non-negative integer order, default marker, and timestamps. A unique `{ owner, order }` index provides owner-scoped ordering without a redundant owner-only index.
- Exported the four PRD ordinary defaults (`New`, `Qualified`, `Proposal`, `Negotiation`) as `DEFAULT_PIPELINE_STAGES` for the development seed milestone. Won and Lost remain Deal statuses; the previous `stageType` field was removed so terminal statuses are not represented as ordinary stage records.
- Added model contract coverage for default stages, status separation, owner/order indexing, color validation, and integer ordering in `apps/server/src/database/models.test.ts`.
- Verification: `pnpm --filter @relio/server exec node --import tsx --test src/database/models.test.ts` — 6/6 tests passed; `pnpm --filter @relio/server typecheck` — passed; `pnpm --filter @relio/server lint` — passed; `pnpm --filter @relio/server build` — passed; Prettier check on the three changed server files — passed.

## Milestone 4.6 — Deal Model

- [x] Define deal name.
- [x] Define deal value.
- [x] Define primary Contact reference.
- [x] Define optional Company reference.
- [x] Define Pipeline Stage reference.
- [x] Define probability.
- [x] Define expected closing date.
- [x] Define description.
- [x] Define status.
- [x] Define lost reason.
- [x] Define actual closing date.
- [x] Define final deal value.
- [x] Define previous ordinary stage for reopening.
- [x] Define owner reference.
- [x] Define timestamps.
- [x] Add appropriate indexes.

### Milestone 4.6 Implementation Record

- Completed `Deal` in `apps/server/src/database/models/deal.ts` with owner, required name/value, Contact and PipelineStage references, optional Company, probability, expected close date, description, status, lost reason, close date/value, and previous stage fields. Existing owner/status and owner/expected-close indexes remain in place.
- Deal value now requires a finite number greater than zero. Lost reasons are restricted to `price`, `competitor`, `no_response`, `not_interested`, `budget_issues`, and `other`, exported as `DEAL_LOST_REASONS`.
- A primary Contact is required for new Deals but may be null on a persisted Deal after Contact deletion. Probability remains optional and bounded from 0 to 100 without a global schema default; stage-based assignment belongs to the later Deal service and stage configuration work.
- Added model contract tests for references, fields, defaults, indexes, positive value, lost-reason options, new-Deal contact requirements, and post-deletion null Contact behavior.
- Verification: `pnpm --filter @relio/server exec node --import tsx --test src/database/models.test.ts` — 7/7 tests passed; `pnpm --filter @relio/server typecheck` — passed; `pnpm --filter @relio/server lint` — passed; `pnpm --filter @relio/server build` — passed; Prettier check on the three changed server files — passed.

## Milestone 4.7 — Task Model

- [x] Define title.
- [x] Define description.
- [x] Define task type.
- [x] Define status.
- [x] Define priority.
- [x] Define optional due date.
- [x] Define optional due time.
- [x] Define optional related entity.
- [x] Ensure a task relates to no more than one entity.
- [x] Define reminder settings.
- [x] Define completion timestamp.
- [x] Define owner reference.
- [x] Define timestamps.
- [x] Add appropriate indexes.

### Milestone 4.7 Implementation Record

- Completed `Task` in `apps/server/src/database/models/task.ts` with owner, title, description, Regular Task/Follow-up type, PRD status and priority enums, optional due date/time, a single optional Contact/Company/Deal relationship, reminder time, completion timestamp, timestamps, and owner-scoped due-date/status indexes.
- Validation requires the related entity type and ID to be set together. The reminder time is derived as one day before the due date and cleared when no due date exists. Completion sets `completedAt`; other statuses clear it.
- Added model contract coverage for field defaults/enums, relationship pairing, reminder scheduling, completion timestamps, and indexes in `apps/server/src/database/models.test.ts`. Notification delivery and task API workflows are not implemented in this database milestone.
- Verification: `pnpm --filter @relio/server exec node --import tsx --test src/database/models.test.ts` — 8/8 tests passed; `pnpm --filter @relio/server typecheck` — passed; `pnpm --filter @relio/server lint` — passed; `pnpm --filter @relio/server build` — passed; Prettier check on the two changed server files — passed.

## Milestone 4.8 — Activity Model

- [x] Define activity type: Note, Call, Email, Meeting.
- [x] Define title.
- [x] Define description/content.
- [x] Define related Contact.
- [x] Define related Deal.
- [x] Define related Company.
- [x] Define activity date.
- [x] Define scheduled date/time where applicable.
- [x] Define owner reference.
- [x] Define timestamps.
- [x] Add appropriate indexes.

### Milestone 4.8 Implementation Record

- Completed `Activity` in `apps/server/src/database/models/activity.ts` with the PRD activity types, required title and activity date, optional content, optional Contact/Company/Deal references, optional scheduled date/time, owner reference, and timestamps.
- Added owner-scoped compound indexes for Contact, Company, and Deal timelines ordered by activity date, plus an owner/scheduled-date index for scheduled activity queries.
- Added model contract coverage for activity types, required and optional fields, references, timestamps, indexes, and scheduled Call/Meeting records in `apps/server/src/database/models.test.ts`.
- Verification: `pnpm --filter @relio/server exec node --import tsx --test src/database/models.test.ts` — 9/9 tests passed; `pnpm --filter @relio/server typecheck` — passed; `pnpm --filter @relio/server lint` — passed; `pnpm --filter @relio/server build` — passed; Prettier check on the two changed server files — passed.

## Milestone 4.9 — Deal History Model

- [x] Define Deal reference.
- [x] Define history event type.
- [x] Define previous value where applicable.
- [x] Define new value where applicable.
- [x] Define previous stage where applicable.
- [x] Define new stage where applicable.
- [x] Define event date.
- [x] Define owner reference.
- [x] Preserve history independently of Contact Activities.

### Milestone 4.9 Implementation Record

- Completed `DealHistory` in `apps/server/src/database/models/deal-history.ts` with required owner and Deal references, event type, optional previous/new values and stages, event date, and timestamps.
- Replaced ambiguous `status_changed`/`closed` values with the PRD event set: `created`, `stage_changed`, `value_changed`, `won`, `lost`, and `reopened`. Exported the event set and its TypeScript union for later history-writing services.
- Deal history remains a separate model referencing the Deal directly, with no Contact or Activity reference. Added an owner/Deal/event-date index for scoped chronological history queries. Deletion behavior is validated in the later relationship-integrity milestone.
- Added model contract tests for the exact event set, required references, snapshots, timestamps, index, and separation from Contact Activities in `apps/server/src/database/models.test.ts`.
- Verification: `pnpm --filter @relio/server exec node --import tsx --test src/database/models.test.ts` — 10/10 tests passed; `pnpm --filter @relio/server typecheck` — passed; `pnpm --filter @relio/server lint` — passed; `pnpm --filter @relio/server build` — passed; Prettier check on the three changed server files — passed.

## Milestone 4.10 — Notification Model

- [x] Define notification type.
- [x] Define title.
- [x] Define message.
- [x] Define related entity.
- [x] Define read/unread state.
- [x] Define owner reference.
- [x] Define timestamps.
- [x] Add appropriate indexes.

### Milestone 4.10 Implementation Record

- Completed `Notification` in `apps/server/src/database/models/notification.ts` with the six PRD notification categories, required title/message and owner, optional Contact/Company/Deal/Task relation, read state, and timestamps.
- Exported the notification type set and TypeScript union. The related entity type and ID must be supplied together; `User` is not a related entity because ownership is represented separately.
- Added owner-scoped indexes for unread/recent notification queries and type-filtered queries. Notification generation and delivery remain in the later notifications phase.
- Added model contract coverage for the exact PRD event set, required content, optional relation pairing, unread default, timestamps, and indexes in `apps/server/src/database/models.test.ts`.
- Verification: `pnpm --filter @relio/server exec node --import tsx --test src/database/models.test.ts` — 11/11 tests passed; `pnpm --filter @relio/server typecheck` — passed; `pnpm --filter @relio/server lint` — passed; `pnpm --filter @relio/server build` — passed; Prettier check on the three changed server files — passed.

## Milestone 4.11 — Relationships & Data Integrity

- [x] Ensure every user-owned record references its owner.
- [x] Ensure Contact can have zero or one Company.
- [x] Ensure Company can have multiple Contacts.
- [x] Ensure a new Deal requires a Primary Contact.
- [x] Ensure Deal can remain after Contact deletion.
- [x] Ensure Deal History survives Contact deletion.
- [x] Ensure Company deletion unlinks Contacts.
- [x] Ensure Company deletion unlinks Deals.
- [x] Ensure historical Activities are preserved when Company is deleted.
- [x] Define Pipeline Stage deletion and reassignment behavior.
- [x] Ensure user ownership is respected across references.

### Milestone 4.11 Implementation Record

- Added `apps/server/src/database/relationship-integrity.ts` with an owner-scoped reference guard and MongoDB-session transaction helpers for relationship deletions.
- Contact deletion removes its related Tasks and Activities, nulls retained Deals' `primaryContact`, and leaves DealHistory records untouched. Company deletion unlinks Contacts and Deals and deletes only the Company, leaving historical Activities and DealHistory records untouched.
- Pipeline Stage deletion counts both current and previous-stage Deal references. A replacement owned by the same user is required when referenced; current and previous stage links are reassigned before the stage is deleted.
- Extended model contract tests to verify owner requirements and the deletion/reassignment policy through an injected integrity store. Future CRM create/update services must use `assertOwnedReferences` when validating related records.
- Verification: the server test suite (`api`, `query`, `validation`, upload, and model tests) — 25/25 passed; `pnpm --filter @relio/server typecheck` — passed; `pnpm --filter @relio/server lint` — passed; `pnpm --filter @relio/server build` — passed; Prettier check on the integrity service and model tests — passed. Live MongoDB transaction behavior was subsequently exercised by the opt-in integration test recorded under Milestone 4.12.

## Milestone 4.12 — Database Seed & Validation

**Status:** Completed

- [x] Create development seed infrastructure.
- [x] Create default Pipeline Stages.
- [x] Prepare realistic development data.
- [x] Avoid fake production testimonials or metrics.
- [x] Validate schemas.
- [x] Validate indexes against the configured development database.
- [x] Validate relationships.
- [x] Validate deletion behavior through integrity policy tests.
- [x] Update architecture documentation.

### Milestone 4.12 Implementation Record

- Added `pnpm --filter @relio/server seed:dev`, backed by `apps/server/src/database/seed-cli.ts` and `apps/server/src/database/seed.ts`. The command refuses to run unless `NODE_ENV=development`, upserts a dedicated `.test` sample owner and linked CRM records without overwriting existing samples, and seeds the four `DEFAULT_PIPELINE_STAGES`.
- Seed records cover a company, contact, open deal, follow-up, activity, DealHistory, and notification. They are internal development records only; no testimonials or product-performance metrics are seeded.
- The seed workflow runs schema validation on its records, creates declared indexes, verifies database index keys/options, and checks owner-scoped references. Unit coverage includes the environment guard and integrity policy; an opt-in integration test exercises the Mongoose transaction adapter against MongoDB using unique temporary development fixtures and removes them after the test.
- The shared `connectDatabase()` helper now configures the DNS resolvers used by both API startup and the seed CLI. The first seed attempt exposed that resolver setup had only been applied by `server.ts`; after moving it to the shared connection path, the seed and transaction integration checks connected successfully.
- Validation: `pnpm --filter @relio/server seed:dev` — passed against the configured development database, creating and verifying declared indexes and persisting the dedicated sample records; `RELIO_DB_INTEGRATION=1 pnpm --filter @relio/server exec node --import tsx --test src/database/relationship-integrity.integration.test.ts` — 1/1 passed; full server test set — 26/26 passed; server typecheck, lint, and build — passed.
- The development seed data is internal sample data only; no testimonials or product-performance metrics are seeded. The integration test uses a unique `.test` owner and removes its records in `finally`.

### Phase 4 Acceptance Criteria

- [x] All required models exist.
- [x] Relationships and ownership rules are enforced.
- [x] Deletion behavior follows the PRD.
- [x] Default development data can be seeded.
- [x] Database schemas and indexes are validated.

### Phase 4 Validation Record

Phase 4 is complete. All database models, ownership relationships, deletion policies, development seed behavior, and declared indexes have been validated. MongoDB transaction behavior was exercised against the configured development database with isolated temporary fixtures.

Validation:

- `pnpm --filter @relio/server seed:dev` — passed; indexes, seed records, and owner-scoped references validated against MongoDB.
- Opt-in relationship integration test — 1/1 passed; temporary test data was cleaned up.
- Server tests — 26/26 passed; server lint, typecheck, and build — passed.
- Targeted Prettier check on changed server source — passed. Workspace `pnpm format:check` still reports pre-existing formatting differences in `models/company.ts`, `models/contact.ts`, and `models/user.ts`; those unrelated files were left unchanged.

Phase 5 began with Milestone 5.1 after the user's explicit instruction to proceed.

---

# Phase 5 — Authentication & User Management

**Status:** In Progress

## Milestone 5.1 — Authentication Backend

**Status:** Completed

- [x] Implement user registration.
- [x] Validate username.
- [x] Validate email.
- [x] Validate password.
- [x] Hash passwords securely.
- [x] Implement email/password login.
- [x] Implement Google OAuth.
- [x] Implement logout.
- [x] Generate JWT.
- [x] Store JWT in secure HTTP-only cookies.
- [x] Configure cookie expiration.
- [x] Configure SameSite behavior.
- [x] Configure Secure behavior for production.
- [x] Implement authentication middleware.
- [x] Implement protected API routes.
- [x] Implement current-user endpoint.
- [x] Implement session restoration.
- [x] Implement forgot-password request.
- [x] Implement password reset token.
- [x] Implement password reset endpoint.
- [x] Configure password reset email delivery.
- [x] Implement change-password endpoint.
- [x] Implement profile retrieval.
- [x] Implement profile update.
- [x] Prevent email changes.
- [x] Implement account deletion.
- [x] Persist user theme preference: Light, Dark, or System.
- [x] Persist notification preferences.
- [x] Persist the user's default currency, initially USD.
- [x] Do not add currency conversion or multi-currency support to the MVP.

### Milestone 5.1 Implementation Record

- Added authentication routes under `/api/v1/auth`: registration, email/password login, Google ID-token sign-in, logout, forgot password, and password reset. Protected user routes under `/api/v1/users` provide current-user/session restoration, profile update, password change, and account deletion. The company-logo upload route is now mounted under `/api/v1/uploads/company-logo` behind authentication.
- Passwords use Node.js `scrypt` with per-password random salts and timing-safe verification. Reset tokens are random, stored only as SHA-256 hashes, expire after 30 minutes, and are consumed atomically. Password changes, resets, and logout increment the user's session version so existing JWTs are rejected.
- Session JWTs are restricted to the HTTP-only `relio_session` cookie, have a configured expiry, use `SameSite=Lax`, and set `Secure` in production. Sensitive authentication routes have a dedicated rate limiter. No email verification is required.
- Google ID tokens are verified server-side against `GOOGLE_CLIENT_ID`; verified email identities are linked to an existing account or create a new account. A partial unique index prevents one Google identity from being attached to multiple accounts while excluding legacy empty values.
- SMTP reset delivery uses `SMTP_HOST`, optional `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. The reset response is generic to avoid account enumeration; delivery failures clear the token and are logged without user details. Google and SMTP settings are optional in local configuration, so those provider flows require credentials to operate.
- Profile updates persist theme and notification preferences plus USD-only default currency; strict validation rejects email changes and other currencies. Account deletion transactionally removes the user's owned CRM records before deleting the account.
- Validation: authentication and model tests — 19/19 passed; complete non-integration server test suite — 32/32 passed; server lint, typecheck, production build, and targeted Prettier check — passed.
- Provider limitation: live Google verification and SMTP delivery were not exercised because external provider credentials are not configured. Forgot-password requests return 503 when SMTP is unconfigured. Account deletion's transaction path was typechecked and reviewed but not run against MongoDB here.

Phase 5 remains In Progress. Milestone 5.2 is underway.

## Milestone 5.2 — Authorization & Ownership

**Status:** In Progress

- [ ] Enforce user ownership on every protected resource.
- [ ] Prevent access to other users' records.
- [x] Validate ownership of referenced entities.
- [x] Protect update operations on currently implemented protected user resources.
- [x] Protect delete operations on currently implemented protected user resources and relationship-integrity operations.
- [ ] Prevent cross-user relationship references.
- [ ] Verify authorization in all CRM modules.

### Milestone 5.2 Implementation Record

- Confirmed all currently mounted user-data routes (`/api/v1/users`) apply `requireAuthentication`, derive the acting user from verified session context, and protect profile updates, password changes, and account deletion. The company-logo upload route also applies authentication before multipart parsing or storage.
- Expanded the authentication API boundary test to verify unauthenticated profile read/update, password change, account deletion, and company-logo upload requests receive 401 responses.
- Expanded relationship-integrity coverage across Contact, Company, Deal, PipelineStage, Task, Activity, DealHistory, and Notification references. Foreign-owner references are rejected, and a foreign-owner Contact deletion is rejected before any mutation is applied.
- Validation: complete server suite including the opt-in MongoDB relationship integration test — 33/33 passed; the live integration verified all eight owned-reference model types and confirmed a foreign-owner delete leaves records intact. Server lint, typecheck, production build, and Prettier check on changed tests — passed.
- Scope limitation: no CRM CRUD modules or resource routes exist yet, so record-level read/update/delete authorization and cross-user relationship rejection cannot be verified end to end. Keep the milestone In Progress; each Phase 6 module must owner-scope reads and mutations, call `assertOwnedReferences` for related records, and add API-level cross-user tests before this milestone can be completed.

## Milestone 5.3 — Authentication Frontend

**Status:** Completed

- [x] Create Login page.
- [x] Create Register page.
- [x] Create Forgot Password page.
- [x] Create Reset Password page.
- [x] Implement form validation.
- [x] Implement password visibility.
- [x] Implement Google sign-in button.
- [x] Implement authentication state.
- [x] Implement session restoration.
- [x] Implement protected routes.
- [x] Implement logout behavior.
- [x] Implement user profile menu.
- [x] Implement Profile Settings for username, avatar, and basic profile information.
- [x] Implement Security Settings for password changes and account deletion; do not add email changes.
- [x] Implement Preferences for theme, notification preferences, and default currency.
- [x] Implement authentication loading states.
- [x] Implement error and success feedback.

### Milestone 5.3 Implementation Record

- Added a responsive authentication layout based on the provided Relio reference, using `apps/client/public/auth.png` as visibly labeled illustrative workspace artwork and the supplied Google icon. The hand-built preview dashboard was removed; Google is the only social sign-in option.
- Added cookie-backed API calls and an auth context that restores the server session, synchronizes the account theme, and keeps tokens out of local storage. `/app/*` routes require a restored authenticated user and send unauthenticated users to login with their destination preserved.
- Login and registration use React Hook Form and Zod validation, show field/API errors, support password visibility, and submit to the existing backend. Forgot/reset password forms use the existing endpoints.
- Added profile, security, and preferences settings, including editable username/basic profile, disabled email changes, password change, confirmed account deletion, persisted theme and notification preferences, and USD-only currency. Profile images upload from the device through the authenticated Cloudinary avatar endpoint and save the resulting secure URL; the profile form supports image removal.
- Settings actions report profile, password, avatar, and notification-preference success/failure through the existing notification provider. The profile save button maintains a stable width and exposes a spinner plus a pending label.
- Added ignored local env configuration containing only the public Google web client ID and placeholder examples for client/server env setup. No Google client secret is exposed to Vite or bundled client code.
- Validation: workspace `pnpm typecheck` and `pnpm build` — passed; workspace `pnpm lint` — passed with 12 existing non-blocking warnings; targeted Prettier check — passed. Server tests confirm the avatar endpoint requires authentication and uses the image signature/size limits. Browser checks verified registration routing and validation, session restoration, settings tabs and preference controls, reset-token required state, and no horizontal overflow at 1440px, 1024px, and 375px. Temporary registration accounts were deleted after tests.
- Provider limitation: a valid Google ID token was not available for a live sign-in test; an invalid credential was rejected by the backend as expected. SMTP password-reset delivery was not exercised. Cloudinary upload was not executed against external storage; configure Cloudinary credentials to verify delivery. Configure a valid Google Web client ID/origin and SMTP credentials to test those external flows.

Phase 5 remains In Progress because successful Google sign-in and SMTP reset-email delivery still need provider-backed verification. Milestone 5.2 is being closed incrementally as Phase 6 modules add owner-scoped routes and cross-user API tests; Contacts is now verified, while the remaining CRM modules are not implemented yet.

## Milestone 5.4 — Authentication Testing

- [x] Test successful registration.
- [x] Test duplicate email registration.
- [x] Test invalid credentials.
- [x] Test successful login.
- [x] Test logout.
- [x] Test session restoration.
- [x] Test expired tokens.
- [x] Test Google OAuth.
- [x] Test forgot password.
- [x] Test password reset.
- [x] Test change password.
- [x] Test account deletion.
- [x] Test profile and preference persistence, including USD as the default currency.
- [x] Verify email changes and multi-currency conversion are not exposed.
- [x] Test protected routes.
- [x] Test cross-user access prevention.
- [x] Run lint, typecheck, and build.

### Milestone 5.4 Implementation Record

- Added `apps/server/src/modules/auth/auth.integration.test.ts`, an opt-in real-HTTP integration test gated by `RELIO_AUTH_INTEGRATION=1`. It requires `NODE_ENV=development`, uses unique temporary `.test` accounts, and removes its fixtures in `finally`.
- Verified successful registration and immediate session access, duplicate email conflict, invalid password rejection, successful login, HTTP-only/Lax/path cookie attributes, session restoration, expired-token rejection, logout cookie clearing and invalidation, reset-token consumption and reuse rejection, password-change session rotation, and account deletion through a MongoDB transaction.
- Verified persisted theme and notification preferences, USD default/persistence, rejection of email updates and non-USD currency, and unauthenticated protected-route rejection. With configured Google credentials, an invalid ID token is rejected. Forgot-password requests return the expected 503 while SMTP is unconfigured.
- Validation: all server tests, including the opt-in authentication and relationship MongoDB integration tests — 35/35 passed; workspace `pnpm lint` — passed with 0 errors and 12 existing client warnings; `pnpm typecheck` — passed; `pnpm build` — passed; targeted Prettier check on the new test — passed.
- Remaining verification: successful Google sign-in requires a provider-issued valid ID token; password-reset email delivery requires SMTP credentials. CRM record-level cross-user API tests cannot run until those resource routes are implemented in Phase 6; existing Milestone 5.2 relationship guards remain covered separately. Keep this milestone and Phase 5 In Progress until these cases can be verified.

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

**Status:** In Progress

## Milestone 6.1 — Contacts Module

**Status:** Completed

### Backend

- [x] Implement Contact create endpoint.
- [x] Implement Contact list endpoint.
- [x] Implement Contact details endpoint.
- [x] Implement Contact update endpoint.
- [x] Implement Contact delete endpoint.
- [x] Implement search.
- [x] Implement filters.
- [x] Implement sorting.
- [x] Implement pagination.
- [x] Implement bulk actions.
- [x] Implement Contact statistics.
- [x] Implement related Deals retrieval.
- [x] Implement related Tasks retrieval.
- [x] Implement Contact Activities retrieval.
- [x] Enforce ownership and validation.

### Frontend

- [x] Create Contacts list page.
- [x] Implement table view.
- [x] Implement grid view.
- [x] Implement search.
- [x] Implement filters.
- [x] Implement sorting.
- [x] Implement pagination.
- [x] Implement row selection.
- [x] Implement bulk actions.
- [x] Implement Add Contact side sheet.
- [x] Implement Edit Contact side sheet.
- [x] Implement Delete confirmation.
- [x] Implement Contact details page.
- [x] Implement Overview tab.
- [x] Implement Deals tab.
- [x] Implement Tasks & Follow-ups tab.
- [x] Implement Activity Timeline.
- [x] Implement loading states.
- [x] Implement empty states.
- [x] Implement error states.
- [x] Implement success feedback.
- [x] Validate responsive behavior.

### Contact Fields & Rules

- [x] First Name (required).
- [x] Last Name (required).
- [x] Email.
- [x] Phone.
- [x] Company.
- [x] Contact Type: Lead, Client, Former Client, Partner.
- [x] Job Title.
- [x] Tags.
- [x] Website.
- [x] Notes.
- [x] Support zero or one Company.
- [x] Support multiple Deals per Contact.
- [x] Support searchable Company selection.

### Contact List Behavior

- [x] Show avatar/name/email.
- [x] Show Company.
- [x] Show Contact Type.
- [x] Show Deals count.
- [x] Show Last Activity.
- [x] Show Added date.
- [x] Show row actions.
- [x] Filter by Type.
- [x] Filter by Company.
- [x] Filter by Tags.
- [x] Filter by Date Added.
- [x] Sort by Name.
- [x] Sort by Recently Added.
- [x] Sort by Last Activity.

### Contact Deletion Rules

- [x] Delete Contact.
- [x] Delete related Tasks and Follow-ups.
- [x] Delete related Activities.
- [x] Retain related Deals.
- [x] Set deleted Contact as null on retained Deals.
- [x] Retain Deal History.

### Milestone 6.1 Implementation Record

- Added the authenticated `/api/v1/contacts` module with strict Zod request/query schemas, owner-scoped CRUD, allowlisted search/filter/sort/page handling, type statistics, searchable owner-scoped Company options, and related Deal, Task, and Activity retrieval. Contact details include owner-scoped Deal count and latest Activity date.
- Contact deletion reuses the relationship-integrity transaction boundary. Bulk deletion validates every selected Contact before mutating; related Tasks and Activities are deleted, retained Deals have `primaryContact` set to `null`, and Deal History is preserved. Cross-user record reads and writes return not found, and foreign-owner Company references are rejected.
- Added the authenticated Contacts list and profile routes. The list supports table/grid views, selection, bulk deletion, filters, sorting, server pagination, stats, loading/empty/error/success states, and Add/Edit sheets. Contact profiles include Overview, Deals, Tasks & Follow-ups, and Activity Timeline tabs.
- Company selection and filtering use Hairline's server-searchable Combobox with abortable requests. A migration command, `pnpm --filter @relio/server migrate:contact-email-index`, changes the previous unique `{ owner, email }` index to non-unique because the PRD does not require unique Contact emails; it is restricted to development environments. The migration was applied to the configured development database.
- Validation: Contact schema tests — 4/4 passed; non-integration server suite — 37/37 passed; `RELIO_CONTACTS_INTEGRATION=1 pnpm --filter @relio/server exec node --import tsx --test src/modules/contacts/contacts.integration.test.ts` — 1/1 passed against MongoDB. The integration covers auth, owner isolation, Company references, list filters/pagination/stats, Contact updates, related records, and deletion invariants.
- Workspace `pnpm lint` — passed with 0 errors and 13 warnings in existing components/providers; `pnpm typecheck` — passed; `pnpm build` — passed. Prettier passes for all changed files. Workspace `pnpm format:check` still reports the pre-existing formatting difference in `apps/server/src/database/models/company.ts`.
- Browser verification: Contact creation, form validation/feedback, profile navigation, tabs and empty states, and responsive list/profile layouts at 1440px, 768px, 375px, and 320px were checked. No horizontal overflow remained. A temporary browser account and its records were deleted through Settings after verification.

Phase 6.1 is complete. Milestone 6.2 — Companies is the next incomplete milestone. Phase 5 remains In Progress for external Google/SMTP verification and authorization coverage in the remaining CRM modules.

## Milestone 6.2 — Companies Module

**Status:** Completed

### Backend

- [x] Implement Company create endpoint.
- [x] Implement Company list endpoint.
- [x] Implement Company details endpoint.
- [x] Implement Company update endpoint.
- [x] Implement Company delete endpoint.
- [x] Implement search.
- [x] Implement filters.
- [x] Implement sorting.
- [x] Implement pagination.
- [x] Implement bulk actions.
- [x] Implement Company statistics.
- [x] Implement related Contacts retrieval.
- [x] Implement related Deals retrieval.
- [x] Implement related Activities retrieval.
- [x] Implement logo upload integration.

### Frontend

- [x] Create Companies list page.
- [x] Implement table view.
- [x] Implement grid view.
- [x] Implement search.
- [x] Implement filters.
- [x] Implement sorting.
- [x] Implement pagination.
- [x] Implement row selection.
- [x] Implement bulk delete.
- [x] Implement export selected.
- [x] Implement Add Company side sheet.
- [x] Implement Edit Company side sheet.
- [x] Implement Delete confirmation.
- [x] Implement Company details page.
- [x] Implement Overview tab.
- [x] Implement Contacts tab.
- [x] Implement Deals tab.
- [x] Implement Activities tab.
- [x] Implement Notes through Activity records.
- [x] Implement loading, empty, error, and success states.

### Company Fields & Rules

- [x] Company Name (required).
- [x] Website.
- [x] Industry.
- [x] Email.
- [x] Phone.
- [x] Address.
- [x] Description.
- [x] Company Size.
- [x] Annual Revenue (numeric USD).
- [x] LinkedIn URL.
- [x] Logo upload.
- [x] Generate fallback avatar using first two letters.
- [x] Show duplicate-name warning but allow duplicates.
- [x] Industry options follow the PRD.
- [x] Company Size options follow the PRD.

### Company Statistics & List

- [x] Total Companies.
- [x] Total Contacts.
- [x] Active Deals.
- [x] Total Deal Value.
- [x] Show company logo/name.
- [x] Show Industry.
- [x] Show Size.
- [x] Show Contacts count.
- [x] Show Active Deals.
- [x] Show Total Deal Value.
- [x] Show Added date.
- [x] Filter by Industry.
- [x] Filter by Size.
- [x] Filter by Number of Contacts.
- [x] Filter by Date Added.
- [x] Sort by Name.
- [x] Sort by Recently Added.
- [x] Sort by Deal Value.

### Company Details Rules

- [x] Contacts tab uses a table.
- [x] Add Contact from Company automatically links the Company.
- [x] Company Activities include related Contact and Deal activities.
- [x] Display source labels in aggregated timelines.
- [x] Notes are Activity records of type Note.
- [x] Avoid creating a separate Notes entity.

### Company Deletion Rules

- [x] Delete Company only.
- [x] Retain its Contacts.
- [x] Set their Company reference to null.
- [x] Retain related Deals.
- [x] Set their Company reference to null.
- [x] Preserve historical Activities.
- [x] Preserve Deal History.

### Milestone 6.2 Implementation Record

- Added authenticated `/api/v1/companies` CRUD, stats, duplicate check, bulk delete, and related Contacts, Deals, Activities, and Notes endpoints. Zod schemas enforce the PRD industry/size options and allowlisted filters, sorting, date/contact-count ranges, pagination, and request fields. All reads and mutations are owner-scoped.
- Company statistics and list rows include contact counts and open-deal counts/value. Company activity timelines aggregate direct Company, linked Contact, and linked Deal Activities once per Activity, with a source label. Company Notes are stored as `Activity` records of type `note`; no Notes collection was added.
- Company deletion and bulk deletion use a single transaction, validate all selected Companies before mutation, unlink but retain Contacts and Deals, and leave Activities and DealHistory unchanged. Logo selection uses the existing authenticated Cloudinary upload route and JPEG/PNG/WebP/5 MiB validation.
- Fixed the client logo upload to send the `logo` multipart field expected by Multer; added an HTTP parser regression test for the accepted `logo` field and the rejected `file` field. Existing development records with display-label industries/company sizes are normalized for API output and remain discoverable by canonical filters. The development seed now writes canonical enum values.
- Replaced the Company `{ owner, name }` unique index with a non-unique index so the PRD's duplicate-name warning can allow creation. Added `pnpm --filter @relio/server migrate:company-name-index`; the development-only migration was applied to the configured development database.
- Added the Companies table/grid, filters, sorting, pagination, statistics, row selection, selected CSV export, Add/Edit side sheet, duplicate warning, and Company profile tabs. Company-created Contacts are linked to the current Company. AppShell no longer adds a second generic heading to Companies list/profile routes.
- Validation: Companies MongoDB HTTP integration — 1/1 passed, including legacy label filtering/projection; logo multipart regression — 2/2 passed. Full server test set — 40 passed, 3 opt-in integration suites skipped, 0 failed. Workspace `pnpm lint` — 0 errors and 13 existing warnings; `pnpm typecheck`, `pnpm build`, and `pnpm format:check` — passed.
- Browser verification: Company create, profile, pre-linked Contact creation, Notes creation and source labeling, and one-heading behavior passed. List and profile had no horizontal overflow at 320px, 375px, or 1440px. The temporary QA account and its records were deleted through Settings after verification.
- External Cloudinary delivery was not tested against provider credentials. Deal detail navigation remains for Milestone 6.4; no Deal module was started here.
- The Companies UI requires a valid authenticated session and only returns records whose `owner` matches that session. The provided sample Company document has owner `6ae77c4518cd6514cddaccfa`, while the provided User document ID is `6ae88b9c9662688d669fba05`; these IDs do not match. No owner reassignment was performed. Confirm the intended owner before changing stored records.

## Milestone 6.3 — Pipeline Stages Module

**Status:** Completed

### Backend

- [x] Create default stages.
- [x] Implement stage listing.
- [x] Implement stage creation.
- [x] Implement stage renaming.
- [x] Implement stage reordering.
- [x] Implement stage color updates.
- [x] Implement stage deletion.
- [x] Require replacement stage when deleting a stage with Deals.
- [x] Reassign affected Deals before deletion.
- [x] Prevent deletion without valid reassignment.
- [x] Enforce ownership.

### Frontend

- [x] Implement pipeline stage settings.
- [x] Implement add stage.
- [x] Implement rename stage.
- [x] Implement reorder stages.
- [x] Implement color selection.
- [x] Implement delete stage confirmation.
- [x] Implement replacement-stage selection.
- [x] Display default stages.

### Stage Rules

- [x] Default stages: New, Qualified, Proposal, Negotiation.
- [x] Won and Lost are terminal statuses, not ordinary stages.
- [x] Users can add, rename, reorder, recolor, and delete ordinary stages.
- [x] Deleting a stage with Deals requires reassignment.

### Milestone 6.3 Implementation Record

- Added the authenticated `/api/v1/pipeline-stages` module with owner-scoped list/create/update/delete/reorder endpoints and Zod validation for ids, names, colors, and reorder payloads.
- Ensured default pipeline stages seed for owners with no entries and enforce one-stage minimums during deletion.
- Reused the transaction-backed `relationshipIntegrity.deletePipelineStage` guard so deal reassignment is atomic and cross-owner stage writes are rejected.
- Added the Pipeline tab in Account Settings, including add-stage, rename, color editing, reorder controls, loading skeletons, and replacement-stage deletion confirmation.
- Validation: `RELIO_PIPELINE_STAGES_INTEGRATION=1 pnpm --filter @relio/server exec node --import tsx --test src/modules/pipeline-stages/pipeline-stages.integration.test.ts` — 1/1 passed; `pnpm --filter @relio/client typecheck` — passed; `pnpm lint` — 0 errors, 14 existing warnings; `pnpm build` — passed.

## Milestone 6.4 — Deals Module

**Status:** Completed

### Backend

- [x] Implement Deal creation.
- [x] Implement Deal listing.
- [x] Implement Deal details.
- [x] Implement Deal update.
- [x] Implement Deal deletion.
- [x] Implement Deal search.
- [x] Implement filters.
- [x] Implement sorting.
- [x] Implement pagination.
- [x] Implement bulk actions.
- [x] Implement Deal statistics.
- [x] Implement stage changes.
- [x] Implement Won transition.
- [x] Implement Lost transition.
- [x] Implement reopening.
- [x] Implement Deal History creation.
- [x] Implement Deal timeline retrieval.
- [x] Implement related Tasks retrieval.
- [x] Enforce ownership.

### Frontend — Deal Views

- [x] Create Deals page.
- [x] Implement Kanban view.
- [x] Implement Table view.
- [x] Implement view toggle.
- [x] Implement drag-and-drop between stages.
- [x] Implement stage headers.
- [x] Show Deal count per stage.
- [x] Show total value per stage.
- [x] Implement add Deal action per stage.
- [x] Implement Deal cards.
- [x] Implement search.
- [x] Implement filters.
- [x] Implement sorting.
- [x] Implement pagination where appropriate.
- [x] Implement row selection.
- [x] Implement bulk Delete Selected.
- [x] Implement bulk Change Stage.
- [x] Implement bulk Export Selected.

### Deal Cards

- [x] Deal Name.
- [x] Contact Name.
- [x] Company.
- [x] Deal Value.
- [x] Probability.
- [x] Expected Closing Date.

### Deal Statistics

- [x] Total Deals.
- [x] Active Deals.
- [x] Pipeline Value.
- [x] Won Revenue.
- [x] Lost Deals.

### Deal Fields & Forms

- [x] Deal Name (required).
- [x] Deal Value (required and greater than zero).
- [x] Primary Contact (required on creation).
- [x] Company (optional).
- [x] Pipeline Stage (required).
- [x] Probability (optional, default based on stage).
- [x] Allow manual probability override.
- [x] Expected Closing Date (optional).
- [x] Description (optional).
- [x] Implement searchable Contact Select.
- [x] Support Add Contact from Contact Select.
- [x] Auto-populate Company from selected Contact.
- [x] Allow user to change the selected Company.
- [x] Allow Deal Company to differ from Contact Company.

### Deal Details

- [x] Create Deal details page.
- [x] Show Overview.
- [x] Show Primary Contact.
- [x] Show Company.
- [x] Show Value and Probability.
- [x] Show Stage.
- [x] Show Expected Closing Date.
- [x] Show Description.
- [x] Show Timeline.
- [x] Show Related Tasks.
- [x] Show Deal History.
- [x] Include Deal activities in timeline.
- [x] Include Primary Contact activities in timeline.
- [x] Display source labels.

### Deal Status & History Rules

- [x] Record Deal creation in history.
- [x] Record stage changes.
- [x] Record value updates.
- [x] Record Won transition.
- [x] Record Lost transition.
- [x] Record reopening.
- [x] Confirm before marking Won.
- [x] Confirm before marking Lost.
- [x] Lost Reason is optional.
- [x] Lost Reason options follow the PRD.
- [x] Won records Actual Closing Date.
- [x] Won records Final Deal Value.
- [x] Lost records Lost Date.
- [x] Closed Won value cannot be edited unless reopened.
- [x] Reopening returns to the last ordinary stage.
- [x] Preserve Deal History if Contact is deleted.
- [x] Preserve Deal if Company is deleted.

### Milestone 6.4 Implementation Record

- Added the authenticated `/api/v1/deals` module with owner-scoped CRUD, search, filters, sorting, pagination, stats, bulk-stage updates, reopen/win/lose transitions, task/activity aggregation, and Deal History tracking. The server enforces the PRD deal lifecycle and rejects foreign owner references.
- Implemented the client `DealsPage`, Kanban/table views, Deal cards, filters, statistics, stage controls, CSV export, add/edit sheet, and deal detail page with overview/history/timeline/task views.
- Reused the pipeline-stage defaults and probability logic to keep `New`, `Qualified`, `Proposal`, and custom stages aligned with the configured business rules while preserving manual override behavior.
- Validation: `RELIO_DEALS_INTEGRATION=1 pnpm --filter @relio/server exec node --import tsx --test src/modules/deals/deals.schemas.test.ts src/modules/deals/deals.integration.test.ts` — 5 tests passed, 0 failed.
- The milestone is complete and the next incomplete item in Phase 6 is Milestone 6.5 — Tasks & Follow-ups.

## Milestone 6.5 — Tasks & Follow-ups Module

**Status:** Completed

### Backend

- [x] Implement Task creation.
- [x] Implement Task listing.
- [x] Implement Task details.
- [x] Implement Task update.
- [x] Implement Task deletion.
- [x] Implement Task status changes.
- [x] Implement Task completion timestamp.
- [x] Implement Task filters.
- [x] Implement Task sorting.
- [x] Implement Task pagination.
- [x] Implement bulk actions.
- [x] Implement related entity validation.
- [x] Implement reminder scheduling support.
- [x] Enforce ownership.

### Frontend

- [x] Create Tasks page.
- [x] Implement task list/table.
- [x] Implement status filters.
- [x] Implement priority filters.
- [x] Implement type filters.
- [x] Implement due-date filters.
- [x] Implement related entity filters.
- [x] Implement sorting.
- [x] Implement bulk Complete.
- [x] Implement bulk Delete.
- [x] Implement bulk Change Priority.
- [x] Implement Add Task form.
- [x] Implement Edit Task form.
- [x] Implement Task Details side sheet.
- [x] Implement completion action.
- [x] Implement overdue styling.
- [x] Implement loading, empty, error, and success states.
- [x] Implement a draggable status board with persisted moves.

### Task Fields & Rules

- [x] Title.
- [x] Description.
- [x] Type: Task or Follow-up.
- [x] Status: To Do, In Progress, Completed, Cancelled.
- [x] Priority: Low, Medium, High.
- [x] Optional Due Date.
- [x] Optional Due Time.
- [x] Optional related Contact, Deal, or Company.
- [x] A Task can relate to only one entity.
- [x] Reminder one day before Due Date.
- [x] No reminder without Due Date.
- [x] Record completion timestamp.
- [x] Recurring Tasks remain deferred.
- [x] Calls and Meetings are Activities, not Task types.

### Milestone 6.5 Implementation Record

- Added the authenticated `/api/v1/tasks` module with owner-scoped create/list/detail/update/delete, search, validated filters, sorting, pagination, and bulk delete/complete/priority operations. Related Contact, Company, and Deal references are checked against the acting owner.
- Task writes use Mongoose document validation so reminder timestamps remain one day before the due date, no-date tasks have no reminder, and completion timestamps are set or cleared with status changes.
- Added the Tasks page with list and draggable Kanban views, status/priority/type/due-date/related-type filters, sorting and pagination, bulk actions, Add/Edit forms, a details side sheet, overdue indication, and loading/empty/error/success states. The status board reuses the shared `KanbanBoard` pointer, touch, keyboard, and failed-save rollback behavior.
- Validation: Task schema tests and MongoDB HTTP integration passed; the integration covered owner isolation, related-reference validation, reminders, completion timestamps, filters, sorting, pagination, bulk actions, and deletion. The complete server suite reported 48 passed, 6 optional integration suites skipped, and 0 failed. Workspace lint passed with 0 errors and 17 existing warnings; workspace typecheck and production build passed. Targeted Prettier check passed.
- Browser verification: created a temporary task, dragged it from To Do to In Progress, reloaded to confirm the persisted status, then deleted the temporary account and its records through Account Settings.
- Workspace `pnpm format:check` still reports six unrelated existing formatting differences in the client color-picker files and pipeline-stage module; those files were left unchanged. Notification delivery remains Phase 7 work, and recurring tasks remain deferred.

Milestone 6.5 is complete. Milestone 6.6 — Activities is the next incomplete milestone in Phase 6.

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

**Current Phase:** Phase 6 — Core CRM Modules (In Progress).

**Next Milestone:** Milestone 6.3 — Pipeline Stages Module.

Milestones 6.1 — Contacts and 6.2 — Companies are complete and verified. Continue with Pipeline Stages only; do not begin later Phase 6 milestones automatically. Phase 5 remains In Progress for provider-backed Google/SMTP verification and authorization coverage in the remaining CRM modules.
