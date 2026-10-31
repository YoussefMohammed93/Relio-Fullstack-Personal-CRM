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
| Current Phase | Phase 2 — Frontend Foundation & Design System |
| Next Milestone | 2.1 — Existing Frontend Audit |
| Last Updated | 2026-10-31 |

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
| 2 | Frontend Foundation & Design System | Not Started |
| 3 | Backend Infrastructure & API Foundation | Not Started |
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
- Server configuration and modules: `apps/server/package.json`, `tsconfig.json`, `.env.example`, `src/app.ts`, `src/server.ts`, `src/config/env.ts`, `src/config/security.ts`, `src/database/connect.ts`, `src/errors/AppError.ts`, `src/middleware/error-handler.ts`, `src/middleware/not-found.ts`, and `src/modules/health/health.routes.ts`.
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

**Status:** Not Started

## Milestone 2.1 — Existing Frontend Audit

- [ ] Inspect the complete existing frontend structure.
- [ ] Review installed dependencies.
- [ ] Review Tailwind CSS v4 configuration.
- [ ] Review existing shadcn-compatible setup.
- [ ] Review current routing configuration.
- [ ] Review TanStack Query setup.
- [ ] Identify existing reusable components.
- [ ] Identify duplicated or unnecessary dependencies.
- [ ] Review existing fonts and typography.
- [ ] Review existing CSS variables and theme configuration.
- [ ] Document what can be reused.
- [ ] Avoid recreating existing working infrastructure.

## Milestone 2.2 — Hairline UI Integration

- [ ] Review official Hairline UI documentation.
- [ ] Inspect available Hairline UI components.
- [ ] Inspect Hairline CLI and installation workflow.
- [ ] Review the installed Hairline MCP integration.
- [ ] Use the MCP documentation and component discovery capabilities when available.
- [ ] Integrate Hairline UI using its recommended conventions.
- [ ] Verify compatibility with React 19 and Tailwind CSS v4.
- [ ] Verify compatibility with existing shadcn conventions.
- [ ] Avoid duplicating components already provided by Hairline.
- [ ] Verify that installed components work correctly.
- [ ] Document any integration limitations.

## Milestone 2.3 — Design Tokens & Visual Foundation

- [ ] Establish Relio's visual design direction.
- [ ] Configure semantic color tokens.
- [ ] Configure primary blue accent.
- [ ] Configure background and foreground tokens.
- [ ] Configure card and popover tokens.
- [ ] Configure primary and secondary tokens.
- [ ] Configure muted and accent tokens.
- [ ] Configure destructive and success states.
- [ ] Configure border and input tokens.
- [ ] Configure focus ring tokens.
- [ ] Configure chart color tokens.
- [ ] Configure sidebar tokens.
- [ ] Configure radius and sizing conventions.
- [ ] Avoid arbitrary hardcoded colors.
- [ ] Ensure components use semantic design tokens.
- [ ] Review Hairline default tokens before overriding them.

## Milestone 2.4 — Typography

- [ ] Inspect Hairline's default typography.
- [ ] Configure Geist Sans if not already provided.
- [ ] Configure Geist Mono if needed.
- [ ] Establish heading hierarchy.
- [ ] Establish body text hierarchy.
- [ ] Establish label and helper text styles.
- [ ] Establish numeric and tabular data typography.
- [ ] Verify typography across desktop and mobile.

## Milestone 2.5 — Theme Management

- [ ] Implement Light theme.
- [ ] Implement Dark theme.
- [ ] Implement System theme.
- [ ] Persist user theme preference.
- [ ] Respect system preference when System is selected.
- [ ] Prevent theme flashing where possible.
- [ ] Verify all semantic tokens in both themes.
- [ ] Verify tables, dialogs, dropdowns, and side sheets in both themes.
- [ ] Verify charts and illustrations in both themes.
- [ ] Add reusable theme switcher.

## Milestone 2.6 — Global Application Providers

- [ ] Implement the application provider composition.
- [ ] Configure Router provider.
- [ ] Configure TanStack Query provider.
- [ ] Configure Theme provider.
- [ ] Configure global notification/toast provider.
- [ ] Configure global tooltip provider if required.
- [ ] Keep provider composition clean and maintainable.
- [ ] Avoid unnecessary nested providers.

## Milestone 2.7 — Application Shell

- [ ] Implement the main application layout.
- [ ] Implement responsive sidebar.
- [ ] Implement sidebar navigation structure.
- [ ] Implement active navigation states.
- [ ] Implement sidebar collapse/expand behavior.
- [ ] Implement mobile navigation behavior.
- [ ] Implement top navigation bar.
- [ ] Implement breadcrumbs component.
- [ ] Implement reusable page header.
- [ ] Implement profile menu placeholder.
- [ ] Implement notification access placeholder.
- [ ] Implement global search trigger placeholder.
- [ ] Implement main content container.
- [ ] Establish consistent page spacing.
- [ ] Verify layout responsiveness.

## Milestone 2.8 — Routing Architecture

- [ ] Establish public route group.
- [ ] Establish authentication route group.
- [ ] Establish protected application route group.
- [ ] Configure route layouts.
- [ ] Configure nested routes where appropriate.
- [ ] Add dashboard placeholder.
- [ ] Add Contacts placeholder.
- [ ] Add Companies placeholder.
- [ ] Add Deals placeholder.
- [ ] Add Tasks placeholder.
- [ ] Add Calendar placeholder.
- [ ] Add Activities placeholder.
- [ ] Add Settings placeholder.
- [ ] Add Not Found page.
- [ ] Prepare route protection integration for Phase 5.
- [ ] Avoid implementing actual authentication in this phase.

## Milestone 2.9 — Reusable UI Components

Implement or integrate reusable components using Hairline UI whenever available.

- [ ] Buttons.
- [ ] Inputs.
- [ ] Textareas.
- [ ] Selects.
- [ ] Checkboxes.
- [ ] Radio groups.
- [ ] Switches.
- [ ] Labels.
- [ ] Form field wrappers.
- [ ] Dialogs.
- [ ] Alert dialogs.
- [ ] Side sheets.
- [ ] Dropdown menus.
- [ ] Context menus where needed.
- [ ] Tabs.
- [ ] Tooltips.
- [ ] Popovers.
- [ ] Tables.
- [ ] Badges.
- [ ] Avatars.
- [ ] Cards.
- [ ] Skeletons.
- [ ] Empty states.
- [ ] Confirmation dialogs.
- [ ] Toast notifications.
- [ ] Loading indicators.
- [ ] Pagination primitives.
- [ ] Search input.
- [ ] Filter controls.

## Milestone 2.10 — Responsive & Accessibility Foundation

- [ ] Verify desktop layouts.
- [ ] Verify laptop layouts.
- [ ] Verify tablet layouts.
- [ ] Verify mobile layouts.
- [ ] Verify keyboard navigation.
- [ ] Verify visible focus states.
- [ ] Verify semantic HTML.
- [ ] Verify form labels.
- [ ] Verify dialog accessibility.
- [ ] Verify sufficient color contrast.
- [ ] Verify reduced-motion preferences where applicable.

## Milestone 2.11 — Phase Validation

- [ ] Run formatting.
- [ ] Run ESLint.
- [ ] Run TypeScript checks.
- [ ] Run production build.
- [ ] Fix all introduced errors.
- [ ] Verify Light theme.
- [ ] Verify Dark theme.
- [ ] Verify System theme.
- [ ] Verify responsive application shell.
- [ ] Verify route navigation.
- [ ] Update `PROGRESS.md`.
- [ ] Update `ROADMAP.md`.
- [ ] Update `ARCHITECTURE.md` if actual architectural decisions changed.

### Phase 2 Acceptance Criteria

- Hairline UI is integrated correctly.
- The design system uses semantic tokens.
- Light, Dark, and System themes work.
- The application shell is responsive.
- Routing architecture is established.
- Reusable UI foundations are available.
- No actual CRM business modules or authentication are implemented yet.
- All required validation commands pass.

---

# Phase 3 — Backend Infrastructure & API Foundation

**Status:** Not Started

## Milestone 3.1 — Backend Audit

- [ ] Inspect existing Express application.
- [ ] Review existing middleware.
- [ ] Review environment validation.
- [ ] Review CORS and cookie configuration.
- [ ] Review error handling.
- [ ] Review API health endpoint.
- [ ] Review existing Mongoose and JWT preparation.
- [ ] Reuse existing working infrastructure.

## Milestone 3.2 — Database Connection

- [ ] Configure MongoDB Atlas connection.
- [ ] Validate database environment variables.
- [ ] Implement connection lifecycle.
- [ ] Handle connection failures.
- [ ] Handle reconnection behavior where appropriate.
- [ ] Handle graceful shutdown.
- [ ] Avoid starting the application in an invalid database state.
- [ ] Verify successful database connection.

## Milestone 3.3 — API Standards

- [ ] Establish consistent success response structure.
- [ ] Establish consistent error response structure.
- [ ] Establish API status code conventions.
- [ ] Establish API versioning conventions.
- [ ] Establish pagination response conventions.
- [ ] Establish filtering conventions.
- [ ] Establish sorting conventions.
- [ ] Establish request validation conventions.
- [ ] Establish controller/service responsibilities.

## Milestone 3.4 — Security & Middleware

- [ ] Review and secure CORS configuration.
- [ ] Configure secure cookie defaults.
- [ ] Add security headers.
- [ ] Configure request body limits.
- [ ] Add rate limiting.
- [ ] Add request logging.
- [ ] Configure request ID or correlation ID if useful.
- [ ] Ensure secrets are never exposed.
- [ ] Ensure production error responses do not leak internal details.

## Milestone 3.5 — Shared Backend Utilities

- [ ] Implement reusable pagination utility.
- [ ] Implement reusable filtering utility.
- [ ] Implement reusable sorting utility.
- [ ] Implement reusable validation helpers.
- [ ] Implement reusable API response helpers.
- [ ] Implement reusable error classes.
- [ ] Implement ownership-checking utilities where appropriate.

## Milestone 3.6 — File Upload Foundation

- [ ] Select an appropriate image storage approach.
- [ ] Configure upload validation.
- [ ] Validate file type.
- [ ] Validate file size.
- [ ] Prepare company logo upload support.
- [ ] Secure upload endpoints.
- [ ] Document storage configuration.

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

**Next Phase:** Phase 2 — Frontend Foundation & Design System.

**Next Milestone:** Milestone 2.1 — Existing Frontend Audit.

Before implementation, inspect the repository, current dependencies, existing UI setup, and Hairline UI integration documentation.

Do not start Phase 3 or implement CRM business modules before Phase 2 is completed and reviewed.
