# Relio — Development Roadmap

**Project:** Relio  
**Architecture:** MERN Monorepo  
**Status:** Phase 1 Completed  
**Current Phase:** Phase 2 — Frontend Foundation & Design System

This document is the official execution roadmap for Relio.

Every development phase must be completed, validated, and documented before moving to the next phase.

---

# Phase 1 — Monorepo Initialization & Project Foundation

**Status: COMPLETED**

### Objectives
- Initialize pnpm Workspaces.
- Scaffold React 19 + Vite frontend.
- Scaffold Express 5 + TypeScript backend.
- Configure shared TypeScript.
- Configure ESLint and Prettier.
- Configure Tailwind CSS v4.
- Prepare Hairline UI integration.
- Configure environment validation.
- Prepare MongoDB and JWT infrastructure.
- Create shared TypeScript package.
- Configure Git and `.gitignore`.
- Document project setup.

### Acceptance Criteria
- [x] Dependencies install successfully.
- [x] Frontend runs on port 3000.
- [x] Backend runs on port 5000.
- [x] API health endpoint responds successfully.
- [x] Formatting passes.
- [x] Lint passes.
- [x] Type checking passes.
- [x] Production build passes.
- [x] Git repository initialized.
- [x] Changes pushed to GitHub.

---

# Phase 2 — Frontend Foundation & Design System

**Status: NEXT — NOT STARTED**

### Objectives

Establish the complete visual and technical foundation of the Relio frontend before implementing actual CRM features.

### 2.1 Hairline UI Integration
- Inspect installed Hairline UI MCP capabilities.
- Inspect official Hairline UI documentation and available components.
- Configure Hairline UI using its recommended setup.
- Integrate shadcn conventions.
- Establish reusable component patterns.
- Avoid duplicating existing Hairline components.

### 2.2 Design Tokens
- Configure semantic CSS variables.
- Establish the Relio blue accent.
- Configure background, foreground, border, muted, accent, destructive, and other semantic tokens.
- Establish consistent radius and spacing conventions.
- Ensure Light and Dark themes are cohesive.
- Support System theme preference.

### 2.3 Typography
- Inter Tight for the primary interface, loaded as a variable font.
- Use a system monospace fallback only for contexts that genuinely require it.
- Verify existing Hairline font configuration before installing additional font dependencies.
- Establish heading, body, label, and caption typography scales.

### 2.4 Application Layout
Build reusable layout foundations:

- Main Application Layout.
- Sidebar.
- Top Navbar.
- Main Content Container.
- Breadcrumbs.
- Page Header.
- User Profile Menu.
- Notification Access.
- Global Search Trigger.

Do not implement actual CRM functionality.

### 2.5 Routing
Prepare route architecture for:

- Public Routes.
- Authentication Routes.
- Protected Application Routes.
- Not Found Page.

Create only the minimal route structure needed to verify navigation.

### 2.6 Shared Components

Prepare reusable UI components:

- Buttons.
- Inputs.
- Selects.
- Dialogs.
- Side Sheets.
- Dropdown Menus.
- Tabs.
- Tooltips.
- Popovers.
- Tables.
- Badges.
- Avatars.
- Cards.
- Skeletons.
- Empty States.
- Confirmation Dialogs.
- Toast Notifications.

Prefer existing Hairline components when available.

### 2.7 Application Providers

Configure:

- Theme Provider.
- TanStack Query Provider.
- Router Provider.
- Global Application Providers.

### 2.8 Responsive Design

Establish responsive behavior for:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

### Deliverables
- Complete design token system.
- Working Light/Dark/System themes.
- Reusable component foundation.
- Responsive application shell.
- Functional routing foundation.
- Provider configuration.
- Documented UI conventions.

### Acceptance Criteria
- [ ] Hairline UI integrated correctly.
- [ ] Light and Dark themes work.
- [ ] System theme works.
- [ ] Typography is consistent.
- [ ] Application shell is responsive.
- [ ] Shared components are reusable.
- [ ] No duplicate UI dependencies.
- [ ] Routing works.
- [ ] Lint, typecheck, and build pass.

---

# Phase 3 — Backend Infrastructure & API Foundation

**Status: NOT STARTED**

Some initial infrastructure already exists from Phase 1. Inspect and reuse it instead of recreating it.

### Objectives

Complete the backend infrastructure required for production-oriented development.

### Tasks
- Verify Express middleware configuration.
- Finalize environment validation.
- Configure MongoDB Atlas connection.
- Add connection lifecycle handling.
- Configure centralized API responses.
- Finalize centralized error handling.
- Configure authentication-ready middleware structure.
- Configure request validation patterns.
- Establish API versioning conventions.
- Configure secure CORS and cookies.
- Configure rate limiting.
- Configure security headers.
- Configure request logging.
- Establish file upload infrastructure for company logos.
- Define reusable pagination, filtering, and sorting utilities.

### API Standards

Base path:

`/api/v1`

Establish consistent response structures and error formats.

### Deliverables
- Stable backend infrastructure.
- Working MongoDB connection.
- Reusable API utilities.
- Centralized error handling.
- Security middleware.
- API development conventions.

### Acceptance Criteria
- [ ] MongoDB Atlas connects successfully.
- [ ] Environment validation works.
- [ ] API error handling works.
- [ ] CORS is configured correctly.
- [ ] Security middleware is configured.
- [ ] API response conventions are documented.
- [ ] Health endpoint still works.
- [ ] Build and typecheck pass.

---

# Phase 4 — Database Architecture & Data Modeling

**Status: NOT STARTED**

### Objectives

Design and implement the database layer before implementing authentication and CRM modules.

### Models

1. User.
2. Contact.
3. Company.
4. PipelineStage.
5. Deal.
6. Task.
7. Activity.
8. DealHistory.
9. Notification.

### Tasks
- Define every schema.
- Define required and optional fields.
- Define Mongoose references.
- Define validation rules.
- Define indexes.
- Define timestamps.
- Define ownership relationships.
- Define deletion behavior.
- Define data integrity constraints.
- Define important history records.

### Critical Business Rules

- All records belong to a User.
- A Contact can have zero or one Company.
- A Company can have multiple Contacts.
- A Deal must have a Primary Contact when created.
- A Deal's Primary Contact can become null after Contact deletion.
- Deleting a Contact retains its Deals and Deal History.
- Deleting a Company retains its Contacts and Deals.
- Deleting a Pipeline Stage requires reassignment.
- Deal History must remain independent of Contact Activities.

### Deliverables
- Complete Mongoose schemas.
- Database relationship documentation.
- Index strategy.
- Validation rules.
- Deletion and integrity rules.
- Seed infrastructure for development.

### Acceptance Criteria
- [ ] All schemas implemented.
- [ ] Relationships verified.
- [ ] Ownership references defined.
- [ ] Indexes configured.
- [ ] Critical deletion scenarios tested.
- [ ] Database documentation completed.

---

# Phase 5 — Authentication & User Management

**Status: NOT STARTED**

### Backend
- User Registration.
- Email/Password Login.
- Google OAuth.
- Logout.
- JWT generation and verification.
- Secure HTTP-only cookie handling.
- Forgot Password.
- Password Reset.
- Protected API middleware.
- Ownership authorization.
- User Profile API.
- Change Password.
- Delete Account.

### Frontend
- Login Page.
- Registration Page.
- Forgot Password Page.
- Reset Password Page.
- Google Login Button.
- Authentication Provider / State.
- Protected Routes.
- Session Restoration.
- User Profile Integration.

### Acceptance Criteria
- [ ] Registration works.
- [ ] Login works.
- [ ] Google OAuth works.
- [ ] Logout works.
- [ ] Password reset works.
- [ ] Protected routes work.
- [ ] Session restoration works.
- [ ] User ownership is enforced.
- [ ] Authentication tests pass.

---

# Phase 6 — Core CRM Modules

**Status: NOT STARTED**

Implement modules in the following order.

## Phase 6.1 — Contacts

Backend:
- Contact CRUD.
- Search.
- Filters.
- Sorting.
- Pagination.
- Tags.
- Ownership checks.
- Contact deletion behavior.

Frontend:
- Contacts List.
- Table View.
- Grid View.
- Search and Filters.
- Add/Edit Contact Side Sheet.
- Contact Profile.
- Related Deals.
- Related Tasks.
- Activity Timeline.
- Bulk Actions.

Acceptance:
- Complete Contact lifecycle works with real MongoDB data.

## Phase 6.2 — Companies

Backend:
- Company CRUD.
- Search and filters.
- Sorting and pagination.
- Duplicate detection.
- Company relationships.
- Logo upload.
- Company deletion behavior.

Frontend:
- Companies List.
- Table/Grid Toggle.
- Statistics.
- Add/Edit Company Side Sheet.
- Company Profile.
- Contacts Tab.
- Deals Tab.
- Activities Tab.
- Notes Tab.
- Bulk Delete.
- Export Selected.

Acceptance:
- Company relationships and deletion behavior work correctly.

## Phase 6.3 — Pipeline Stages

Backend:
- Default stage creation.
- Create Stage.
- Update Stage.
- Reorder Stages.
- Delete Stage.
- Stage reassignment rules.
- Default probability configuration.

Frontend:
- Pipeline Settings.
- Stage Creation.
- Stage Editing.
- Stage Reordering.
- Stage Color Selection.
- Stage Deletion Confirmation.

Acceptance:
- Pipeline stages can be managed without losing associated Deals.

## Phase 6.4 — Deals

Backend:
- Deal CRUD.
- Search and filters.
- Sorting and pagination.
- Stage transitions.
- Won/Lost handling.
- Reopening.
- Deal History.
- Contact and Company relationships.

Frontend:
- Deals List.
- Table View.
- Kanban View.
- Drag-and-Drop.
- Deal Statistics.
- Deal Cards.
- Add/Edit Deal Side Sheet.
- Deal Details.
- Related Activities.
- Related Tasks.
- Deal History.

Acceptance:
- Complete Deal lifecycle works, including Won, Lost, and Reopened states.

## Phase 6.5 — Tasks & Follow-ups

Backend:
- Task CRUD.
- Task Types.
- Status Management.
- Priority Management.
- Due Dates.
- Entity Relationships.
- Completion timestamps.
- Reminder scheduling infrastructure.

Frontend:
- Tasks List.
- Task Details Side Sheet.
- Add/Edit Task.
- Filters and Sorting.
- Bulk Actions.
- Overdue Indicators.
- Follow-up workflow.

Acceptance:
- Tasks and Follow-ups work with their defined business rules.

## Phase 6.6 — Activities

Backend:
- Activity CRUD.
- Activity Types.
- Entity relationships.
- Timeline queries.
- Activity source identification.

Frontend:
- Activity Creation.
- Activity Editing.
- Activity Deletion.
- Contact Timeline.
- Company Timeline.
- Deal Timeline.
- Activity Details.

Acceptance:
- Activities appear correctly in all relevant timelines without duplicate records.

---

# Phase 7 — Calendar & Notifications

**Status: NOT STARTED**

## Phase 7.1 — Calendar

- Monthly View.
- Weekly View.
- Daily View.
- Monday as first day of the week.
- Tasks and Follow-ups.
- Scheduled Meetings and Calls.
- Event Type Colors.
- Calendar Navigation.
- Event Details.
- Create Task from Date.
- Create Follow-up from Date.
- Rescheduling supported events.

## Phase 7.2 — Notifications

Backend:
- Notification model.
- Notification creation.
- Reminder processing.
- Upcoming Task Reminders.
- Overdue Task Notifications.
- Upcoming Follow-ups.
- Deal Won/Lost Notifications.
- Approaching Closing Date Notifications.
- Read/Unread state.

Frontend:
- Notification Bell.
- Unread Counter.
- Notification Dropdown.
- Notifications Page.
- Mark as Read.
- Mark as Unread.
- Mark All as Read.

Acceptance:
- In-app notifications are generated and displayed correctly.
- Reminder behavior follows the one-day-before rule.

---

# Phase 8 — Dashboard, Global Search & Data Export

**Status: NOT STARTED**

## Phase 8.1 — Dashboard

- Welcome Header.
- Quick Actions.
- KPI Cards.
- Pipeline Value.
- Won Revenue.
- Revenue Over Time.
- Deals by Stage.
- Contact Growth.
- Deal Conversion Rate.
- Pipeline Overview.
- Recent Deals.
- Recent Contacts.
- Recent Activities.
- Upcoming Tasks.
- Last 90 Days default analytics.

All metrics must use actual backend data.

## Phase 8.2 — Global Search

- Ctrl + K shortcut.
- Search Contacts.
- Search Companies.
- Search Deals.
- Search Tasks.
- Grouped Results.
- Keyboard Navigation.
- Loading and Empty States.

## Phase 8.3 — CSV Export

- Contacts Export.
- Companies Export.
- Deals Export.
- Tasks Export.
- Export Selected.
- Export Filtered Results.
- Correct CSV formatting.
- Ownership verification.

Acceptance:
- Dashboard analytics are accurate.
- Search returns the correct owned records.
- CSV export respects selection, filters, and permissions.

---

# Phase 9 — Landing Page & Onboarding

**Status: NOT STARTED**

## Phase 9.1 — Landing Page

Build the complete public marketing website:

1. Hero.
2. Social Proof.
3. The Problem.
4. Everything in One Place.
5. Client Management.
6. Deal Pipeline.
7. Never Miss a Follow-up.
8. Business Insights.
9. How It Works.
10. Testimonials.
11. Pricing.
12. FAQ + Final CTA.

Requirements:
- Premium SaaS visual design.
- Responsive sections.
- Hairline SVG illustrations.
- Real product screenshots.
- Light/Dark compatibility where appropriate.
- No fabricated testimonials or real-world metrics.

## Phase 9.2 — Onboarding

- Welcome Screen.
- Product Introduction.
- Feature Walkthrough.
- Optional Demo Data.
- Skip Onboarding.
- Remove Demo Data.

Acceptance:
- Landing Page works on desktop and mobile.
- Registration navigation works.
- Onboarding is optional and functional.

---

# Phase 10 — Quality Assurance & Production Deployment

**Status: NOT STARTED**

### Testing
- Frontend Component Tests.
- Backend API Tests.
- Authentication Tests.
- Authorization Tests.
- Database Relationship Tests.
- Business Rule Tests.
- End-to-End Tests.

### Quality
- Responsive Review.
- Accessibility Review.
- Performance Review.
- Bundle Analysis.
- Database Query Review.
- Error Handling Review.
- Security Review.

### Production
- Production Environment Variables.
- Production Database Configuration.
- Build Configuration.
- Frontend Deployment.
- Backend Deployment.
- CORS and Cookie Configuration.
- Production Smoke Tests.
- Backup and Recovery Considerations.

### Acceptance
- All critical workflows work in production.
- No known critical security issues.
- No blocking errors.
- Production configuration verified.
- Project documentation updated.

---

# Future Releases — Outside MVP

## Version 1.1
- Recurring Tasks.
- CSV Import.
- Advanced Analytics.
- Custom Fields.
- Additional Pipeline Customization.

## Version 1.2
- Email Integration.
- Automated Email Reminders.
- Google Calendar Synchronization.
- External Notifications.

## Version 2.0
- AI-powered Client Insights.
- Workflow Automation.
- Subscription and Billing.
- Additional Integrations.

These are future proposals and must not delay the MVP.

---

# Execution Rules

1. Always read the PRD before implementing a feature.
2. Always read this Roadmap before starting work.
3. Implement only the current active phase.
4. Do not skip phases without documenting why.
5. Inspect existing code before changing it.
6. Do not recreate already implemented infrastructure.
7. Every phase must have a clear implementation plan.
8. Divide large phases into small, verifiable tasks.
9. Run relevant validation commands after changes.
10. Fix introduced errors before marking tasks complete.
11. Update PROGRESS.md after each completed milestone.
12. Update this Roadmap's status when a phase is completed.
13. Document important architectural decisions.
14. Never mark a phase complete based only on UI appearance.
15. Do not begin the next phase automatically without reporting the current phase's completion and its validation results.

# Current Execution State

- Phase 1: COMPLETED.
- Phase 2: NEXT.
- Phase 3–10: NOT STARTED.

**Next Action:** Begin Phase 2 — Frontend Foundation & Design System.