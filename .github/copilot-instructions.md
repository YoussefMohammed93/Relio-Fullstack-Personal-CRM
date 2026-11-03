# Relio Repository Instructions

These instructions apply to all GitHub Copilot work in this repository. Read and follow the root `AGENTS.md` and the authoritative project documents before implementation:

- `docs/PRD.md` for requirements and business rules.
- `docs/ROADMAP.md` for phase order and milestones.
- `docs/PROGRESS.md` for actual task status and the next incomplete milestone.
- `docs/ARCHITECTURE.md` for verified technical implementation and decisions.

Do not change product requirements without explicit user approval, implement work outside the active phase, skip milestones, or start a later phase without instruction. Before code changes, inspect the existing implementation and provide a concise plan. After each completed milestone, validate the work and update Progress; update Architecture for real decisions and Roadmap only when a phase is officially completed. Keep documentation factual and distinguish planned work from implemented work.

Every database-backed page must show an accessible loading skeleton while its initial data is loading. Skeletons should reflect the loaded page's actual layout and controls, remain responsive, and be implemented for list and detail pages as well as future database-backed views. Use the existing shared `Skeleton` component and avoid replacing loading states with blank space or generic full-page spinners.
