# Relio Agent Instructions

These instructions apply to every coding agent and every development task in this repository. The repository documentation is authoritative; memory and chat context are supplementary only.

## Authoritative Documents

- `docs/PRD.md` is the source of truth for product requirements and business rules. Do not remove, simplify, reinterpret, or silently change them. Change requirements only after the user explicitly approves the change.
- `docs/ROADMAP.md` defines the official phases, milestones, and order. Do not skip phases, change their order, remove milestones, or begin the next phase without the user's instruction.
- `docs/PROGRESS.md` is the complete Phase 1–10 execution tracker and records actual status, files, validation results, blockers, and deferred work.
- `docs/ARCHITECTURE.md` describes verified implementation and significant decisions separately from planned architecture.

If requirements conflict, are ambiguous, or appear technically problematic, explain the conflict and ask the user before changing product behavior or scope. Do not treat a proposal or planned architecture as implemented.

## Required Workflow For Every Task

1. Read the complete `docs/PRD.md`, `docs/ROADMAP.md`, and `docs/PROGRESS.md`. Read `docs/ARCHITECTURE.md` whenever technical work is involved.
2. Inspect the relevant repository code and instruction files; identify the active phase and its next incomplete milestone.
3. Check whether the requested work already exists. Avoid duplicating working infrastructure.
4. Present a concise plan before implementation.
5. Implement only the user-authorized work in the active phase. Do not start a later phase automatically.
6. Validate the changed behavior and run the relevant lint, typecheck, tests, and build gates.
7. Update `docs/PROGRESS.md` after each completed milestone with actual files, commands/results, known issues, and deferred tasks. Never mark work complete without appropriate verification.
8. Update `docs/ARCHITECTURE.md` for real architectural changes, including decision, reason, alternatives when relevant, and impact.
9. Update `docs/ROADMAP.md` only when a phase is officially completed; do not mark the next phase started without instruction.

## Phase Completion

A phase is complete only when all required implementation tasks and acceptance criteria are satisfied, relevant tests pass, lint and TypeScript checks pass, the production build passes when applicable, no blocking issue remains, and documentation is current. Then update Progress, Roadmap, and Architecture as needed, report the results and next milestone, and stop for the user's instruction.

## Current Project State

Use `docs/PROGRESS.md` as the live status record. At the time these instructions were established, Phase 1 is Completed, Phase 2 — Frontend Foundation & Design System is Not Started and next, and Phases 3–10 are Not Started. Do not begin Phase 2 until instructed.
