# Relio — Technical Architecture

## 1. Project Overview

Relio is a Personal CRM SaaS platform designed for freelancers to manage contacts, companies, deals, tasks, follow-ups, and business activities.

The application follows a Monorepo architecture using pnpm workspaces.

## 1. Current Implementation (Verified 2026-10-31)

This section describes code that exists in the repository. Planned features and target structure are described separately below and must not be treated as implemented.

### Workspace and Tooling

- pnpm workspace packages: `apps/client`, `apps/server`, and `packages/shared`.
- Root scripts run client/server development, recursive builds and typechecks, ESLint, and Prettier.
- TypeScript uses a strict shared base configuration. The client uses Vite/Bundler resolution with an `@/*` alias whose target is explicitly relative; the server and shared package use NodeNext resolution.
- pnpm v11 explicitly allows the `esbuild` install build through `allowBuilds`.

### Client

- React 19, Vite, TypeScript, Tailwind CSS v4 through `@tailwindcss/vite`, React Router, TanStack Query, React Hook Form, Zod, Zustand, Lucide, and the Inter Tight variable font from Fontsource.
- shadcn-compatible `components.json` and semantic CSS variables are configured. `globals.css` defines light/dark semantic palettes, a system dark-mode fallback, Relio blue, status/chart/sidebar tokens, Tailwind v4 radius/spacing mappings, a shared Inter Tight typography scale, and reusable skeleton/loading animations. The official Google Fonts Inter Tight family is self-hosted through `@fontsource-variable/inter-tight`; its variable face supports weights 100–900. The root font and Tailwind's `font-sans` use Inter Tight; `font-mono` retains a system monospace stack for technical contexts only. Hairline's `Button` and `Input` components are source-installed with their `Field`, `TextMorph`, and interaction-motion helpers under `src/components/`; the shared component surface also includes form controls, dialogs and sheets, menus, tabs, tooltips, popovers, tables, filtering, search, pagination, status/identity components, loading and empty states, and cards. These components use the existing semantic tokens; no additional runtime package is required. The shadcn CLI's installed-component listing covers the shadcn registry and does not enumerate these Hairline registry files.
- `ThemeProvider` supports Light, Dark, and System preferences, persists the selection in browser localStorage, and follows OS color-scheme changes in System mode. An inline script in `index.html` applies the initial theme before React loads. `ThemeSwitcher` wraps Hairline's segmented `ThemeToggle` in controlled mode and is displayed in the application shell.
- The application has a React entry point, app component, router, provider composition, and shared QueryClient. The catch-all route renders `AppShell`, which provides responsive sidebar navigation, top navigation, breadcrumbs, a reusable page header, and the main content container. Development-only `/__theme-preview` and `/__components-preview` routes exercise themed surfaces and reusable components with local fixture state. There are no CRM feature pages or product data workflows yet.
- Vite is configured for port `3000`; TypeScript and Vite both resolve the `@/*` source alias.

### Server

- Express 5 and TypeScript run on port `5000`.
- Implemented middleware includes CORS, JSON parsing, cookie parsing, 404 handling, and centralized error handling.
- Zod validates environment variables. `GET /api/v1/health` returns the basic health response.
- A Mongoose connection helper exists but is not called during startup. JWT secret access and secure HTTP-only cookie options are prepared; authentication is not implemented.
- Cloudinary is the selected company-logo image store. The upload module validates JPEG, PNG, and WebP file signatures, enforces a 5 MiB in-memory upload limit, and uploads to a fixed `relio/company-logos` folder. Its route factory requires caller-supplied authentication middleware and remains unmounted until Phase 5 implements authentication.

### Shared Package and Validation

- `@relio/shared` exports compiled TypeScript and currently contains only generic JSON types; it contains no speculative domain models.
- The foundation has passed dependency installation, lint, formatting check, typecheck, and production build. The live client returned HTTP 200 and the health endpoint returned `{"status":"ok"}` during Phase 1 validation.
- No automated test framework or test suite is configured yet.

## 2. Target System Architecture (Planned)

The following target design is guided by `docs/PRD.md` and `docs/ROADMAP.md`. It is not a claim that the listed product modules have been implemented.

### Architecture Style

- Monorepo.
- Modular Monolith Backend.
- Feature-based Frontend Architecture.
- REST API communication.
- MongoDB as the primary database.

### Workspace Structure

```text
relio/
├── apps/
│   ├── client/
│   └── server/
├── packages/
│   └── shared/
├── docs/
├── package.json
└── pnpm-workspace.yaml
```

## 3. Technology Stack: Current and Planned

The lists below describe the selected stack. Current adoption is stated in Section 1; a technology listed here may still be planned rather than implemented.

### Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- Hairline UI
- shadcn/ui conventions
- React Router
- TanStack Query
- React Hook Form
- Zod
- Zustand

### Backend

- Node.js
- Express 5
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT
- HTTP-only Cookies

### Shared Tools

- pnpm Workspaces
- ESLint
- Prettier
- TypeScript

## 4. Planned Frontend Architecture

The frontend is intended to follow a feature-based architecture as Phase 2 and later phases are completed.

Expected structure:

```text
apps/client/src/
├── app/
│   ├── providers/
│   ├── router/
│   └── layouts/
├── components/
│   ├── ui/
│   └── shared/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── contacts/
│   ├── companies/
│   ├── deals/
│   ├── tasks/
│   ├── calendar/
│   ├── activities/
│   ├── notifications/
│   └── settings/
├── hooks/
├── lib/
├── styles/
└── types/
```

### Frontend Rules

- Keep components modular and reusable.
- Organize business features inside `features/`.
- Keep shared UI components inside `components/`.
- Use TanStack Query for server state.
- Use Zustand only for appropriate client-side state.
- Use React Hook Form and Zod for form handling and validation.
- Avoid putting the entire application inside `App.tsx`.
- Reuse existing Hairline UI components before creating new ones.

## 5. Planned Backend Architecture

The backend is intended to follow a Modular Monolith architecture as backend and CRM phases are completed.

Expected structure:

```text
apps/server/src/
├── config/
├── database/
├── middleware/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── contacts/
│   ├── companies/
│   ├── deals/
│   ├── tasks/
│   ├── activities/
│   ├── notifications/
│   └── dashboard/
├── shared/
│   ├── errors/
│   ├── types/
│   ├── utils/
│   └── validators/
├── app.ts
└── server.ts
```

### Backend Module Responsibilities

Each module should encapsulate its own:

- Models
- Routes
- Controllers
- Services
- Validators
- Types (when needed)

Keep business logic inside services rather than route handlers or controllers.

## 6. Planned API Conventions

- API Base Path: `/api/v1`
- Backend Port: `5000`
- Frontend Port: `3000`
- Use RESTful endpoints.
- Validate incoming requests.
- Use centralized error handling.
- Return consistent API response structures.
- Apply authentication and ownership checks to protected resources.

## 7. Planned Authentication Strategy

- JWT-based authentication.
- Secure HTTP-only cookies.
- Password hashing.
- Google OAuth.
- Protected API routes.
- User ownership validation.

Authentication will be implemented in Phase 5.

## 8. Planned Database Strategy

- MongoDB Atlas.
- Mongoose ODM.
- Every user-owned record must reference its owner.
- Use schema validation and appropriate indexes.
- Define relationships and deletion behavior according to the PRD.

Database models will be implemented in Phase 4.

## 9. Planned Application Design System

- Hairline UI as the primary component library.
- Tailwind CSS v4.
- shadcn-compatible conventions.
- Semantic CSS variables.
- Blue accent color.
- Light, Dark, and System themes.
- Inter Tight as the primary interface font, with a system monospace fallback only for technical contexts.
- Responsive layouts.
- Avoid unnecessary shadows and arbitrary hardcoded colors.

## 10. Engineering Principles

- TypeScript strict mode.
- Reusable and maintainable modules.
- Clear separation of concerns.
- No unnecessary dependencies.
- No duplicated UI components.
- Validate all user input.
- Never expose secrets to the frontend.
- Follow existing project conventions.
- Document important architectural changes.

## 11. Architectural Decisions

### pnpm Workspace Monorepo

- **Decision:** Separate client, server, and genuinely shared TypeScript code into pnpm workspace packages.
- **Reason:** This is the selected project structure and allows clear ownership with workspace package references.
- **Alternatives considered:** Separate repositories or placing all code in one package; neither was selected.
- **Impact:** Root scripts orchestrate workspace commands; shared code is exposed through `@relio/shared` exports.

### Client and Server Module Resolution

- **Decision:** Use the Vite `@/*` alias only in the client, and relative `.js` import specifiers in NodeNext server code.
- **Reason:** Vite resolves the client alias explicitly; NodeNext output must also resolve correctly in Node without a path-rewrite runtime.
- **Alternatives considered:** Add a server alias transformation or runtime loader; these add build/runtime complexity and are not needed currently.
- **Impact:** Client alias targets omit deprecated `baseUrl` and use `./src/*`; server imports remain directly runnable after compilation.

### Tailwind and UI Registry

- **Decision:** Use Tailwind CSS v4's Vite integration and shadcn-compatible configuration; add Hairline components from its registry only when needed.
- **Reason:** The PRD selects this UI stack and Hairline components are source-installed rather than a redundant runtime component package.
- **Alternatives considered:** Add another component library or install registry components speculatively; neither is needed for the foundation.
- **Impact:** Hairline source components are added only when needed; the project currently includes its base Button and Input primitives without adding another runtime component library. Additional UI and product screens remain unimplemented.

### Semantic Design Tokens

- **Decision:** Define semantic light and dark tokens in the client global stylesheet and map them through Tailwind CSS v4's `@theme inline`; use a theme provider for Light/Dark/System selection and browser-local persistence, with an inline pre-paint bootstrap and CSS system fallback.
- **Reason:** Hairline and future shared components should consume one semantic contract across themes, including brand, status, chart, and sidebar roles, without scattered hardcoded colors.
- **Alternatives considered:** Keep neutral-only tokens or assign colors per component; neither supports the specified Relio brand or consistent theming. Deferring all persistence until authentication would prevent theme choice in this phase; localStorage is used until authenticated preference storage is implemented in Phase 5.
- **Impact:** Existing components can use the same token names in light and dark contexts. System selection follows live OS changes, and the initial palette is selected before React loads to reduce flashing. Persistence is browser-local for now.

### pnpm Build-Script Approval

- **Decision:** Allow only `esbuild` through pnpm's `allowBuilds` policy.
- **Reason:** Vite requires esbuild's platform binary and pnpm v11 requires explicit approval for dependency lifecycle scripts.
- **Alternatives considered:** Allow every dependency build script; rejected as unnecessarily broad.
- **Impact:** Fresh dependency installs can build esbuild without weakening the policy for other dependencies.

### Inter Tight Font Delivery

- **Decision:** Load the official Google Fonts Inter Tight variable family with `@fontsource-variable/inter-tight` and use it as the global sans font.
- **Reason:** Fontsource provides Vite-compatible CSS and locally bundled WOFF2 assets, avoiding a runtime Google Fonts request while retaining the variable 100–900 weight range.
- **Alternatives considered:** Use the Google Fonts stylesheet with preconnect hints; self-hosting through Fontsource avoids an external font request at runtime and fits the existing package-based setup.
- **Impact:** A single global import bundles the font with the client build. The root and Tailwind `font-sans` share the `Inter Tight Variable` family; the generic `font-mono` utility remains available only for technical content.

### Deferred Database Startup

- **Decision:** Keep the MongoDB connection helper separate from server startup.
- **Reason:** Phase 1 must not require Atlas credentials or a live database just to start the API.
- **Alternatives considered:** Connect at process startup; deferred until Phase 3 database lifecycle work.
- **Impact:** The health route can run without MongoDB; database readiness and production connection lifecycle remain incomplete.

### Cloudinary Company Logo Storage

- **Decision:** Store uploaded company logos in Cloudinary, using the server SDK and server-only credentials.
- **Reason:** The PRD allows user-uploaded company logos, and Cloudinary provides hosted image storage and secure delivery without storing image binaries in MongoDB.
- **Alternatives considered:** Local disk storage is unsuitable for horizontally scaled or ephemeral application hosts; MongoDB binary storage is unnecessary for this image use case.
- **Impact:** Uploads are constrained to JPEG, PNG, or WebP, capped at 5 MiB, and stored under a fixed folder with a 1200-pixel dimension limit. The route requires an authentication middleware parameter and is not mounted until Phase 5 supplies real authentication. Runtime credentials are read from `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the server's ignored `.env`; no environment template is retained in the repository.

Do not silently change established architectural decisions. When a real architectural decision changes, record the decision, reason, alternatives, and impact here.
