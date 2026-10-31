# Relio

Relio is a personal CRM for freelancers. This repository contains the technical
foundation for its MERN monorepo; product features are not implemented yet.

## Requirements

- Node.js 22 or newer
- pnpm 11.28.0

## Development

Install dependencies with `pnpm install`, then start both applications with
`pnpm dev`.

- Client: http://localhost:3000
- Server: http://localhost:5000
- Health: http://localhost:5000/api/v1/health

Copy `apps/server/.env.example` to `apps/server/.env` to customize local server
settings. A MongoDB connection is intentionally not opened during initialization.

## Workspace commands

- `pnpm dev`: Run client and server concurrently.
- `pnpm dev:client`: Run only the Vite client.
- `pnpm dev:server`: Run only the Express server.
- `pnpm build`: Build all workspace packages in dependency order.
- `pnpm lint`: Lint the workspace with ESLint.
- `pnpm typecheck`: Type-check every workspace package.
- `pnpm format`: Format supported files with Prettier.
- `pnpm format:check`: Check formatting without modifying files.

## Structure

- `apps/client`: React, Vite, Tailwind CSS, routing and UI foundations.
- `apps/server`: Express API, environment configuration and infrastructure.
- `packages/shared`: Shared TypeScript types and utilities.

The client includes shadcn/ui-compatible configuration and theme tokens for
Hairline UI registry components. Add Hairline components from the client directory
with `pnpm dlx shadcn@latest add <registry-item-url>` after choosing the needed
component; no feature components are installed by this foundation.
