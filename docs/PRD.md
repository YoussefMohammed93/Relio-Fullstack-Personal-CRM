# RELIO
## Product Requirements Document (PRD)

**Product:** Relio  
**Product Type:** Personal CRM SaaS  
**Target Audience:** Freelancers and Independent Professionals  
**Architecture:** MERN Monorepo — Modular Monolith  
**Document Status:** Product Specification — Initial Version  
**Primary Language:** English  
**Default Currency:** USD

---

# 1. Product Overview

## 1.1 What is Relio?

Relio is a modern Personal CRM platform designed specifically for freelancers and independent professionals.

It helps freelancers manage their professional relationships, organize client information, track business opportunities, manage tasks and follow-ups, and understand their business performance through a centralized workspace.

Instead of managing client information across spreadsheets, notes, messaging applications, and disconnected tools, Relio brings everything together in one organized environment.

## 1.2 Product Vision

Build a simple yet powerful CRM that enables freelancers to manage their entire client relationship lifecycle, from the first contact to closing deals and maintaining long-term professional relationships.

## 1.3 Product Tagline

**Every relationship, well managed.**

Alternative positioning:

Build better relationships. Grow your freelance business.

## 1.4 Target Users

Primary users:

- Freelance Developers.
- Freelance Designers.
- Marketing Professionals.
- Independent Consultants.
- Freelance Agencies' individual operators.
- Independent Business Owners.

## 1.5 Core Problems

Relio addresses the following problems:

- Client information is scattered across different applications.
- Freelancers forget to follow up with potential clients.
- Business opportunities are difficult to track.
- There is no clear overview of active deals and expected revenue.
- Client communication history is difficult to maintain.
- Tasks and deadlines are frequently missed.
- Freelancers lack visibility into their business performance.

## 1.6 Product Goals

1. Centralize all client and company information.
2. Make deal tracking simple and visual.
3. Improve task and follow-up management.
4. Maintain a complete history of professional interactions.
5. Provide useful business analytics.
6. Offer an intuitive, responsive, premium user experience.

---

# 2. Product Scope

## 2.1 MVP Scope

The first production-ready version will include:

- Authentication and Account Management.
- Dashboard and Business Analytics.
- Contact Management.
- Company Management.
- Deal Management and Pipeline.
- Task Management.
- Follow-up Management.
- Calendar.
- Activity Management.
- In-app Notifications.
- User Settings.
- Global Search.
- CSV Export.
- Onboarding Wizard.

## 2.2 Out of Scope for MVP

The following features are intentionally deferred:

- Email Account Integration.
- Automated Email Sending.
- AI-powered Client Insights.
- External Calendar Synchronization.
- Subscription and Billing.
- Recurring Tasks.
- External Push Notifications.
- Automated Email Notifications.
- CSV Import.
- Team Collaboration.
- Multiple Workspaces.

These may be introduced in future versions.

---

# 3. Users, Accounts and Workspace Rules

## 3.1 Account Model

Relio is a single-user Personal CRM.

Each registered user receives one private workspace.

Rules:

- One account represents one freelancer.
- Each account has exactly one workspace.
- No team members or invitations.
- No workspace switching.
- No shared records between users.
- All business records belong to their owner.

## 3.2 Data Ownership

Every user-owned record must be associated with its owner through a `userId` reference.

Backend authorization must verify ownership on every protected operation.

The frontend must never be trusted to determine record ownership.

---

# 4. Authentication and Account Management

## 4.1 Registration

Registration fields:

- Username — Required.
- Email — Required.
- Password — Required.

Requirements:

- Validate input using Zod.
- Hash passwords securely.
- Enforce unique email addresses.
- Enforce unique usernames.
- Create a default user avatar.
- Allow immediate application access after successful registration.
- No mandatory email verification.

## 4.2 Login

Supported authentication methods:

- Email + Password.
- Google OAuth.

GitHub OAuth is not included.

## 4.3 Logout

- Invalidate the authenticated session appropriately.
- Clear authentication cookies.
- Redirect the user to the appropriate public page.

## 4.4 Forgot Password

- User submits their email.
- Generate a secure, time-limited password reset token.
- Send a password reset link through an email service.
- Allow the user to create a new password.
- Invalidate the reset token after use.

## 4.5 Authentication Security

- JWT-based authentication.
- Secure HTTP-only cookies.
- Appropriate SameSite configuration.
- Secure cookie configuration in production.
- Password hashing using a secure password hashing algorithm.
- Rate limiting on sensitive authentication endpoints.
- Input validation.
- Protection against unauthorized access.
- Safe error messages that do not expose sensitive account information.

## 4.6 Authentication Pages

Required screens:

- Login.
- Register.
- Forgot Password.
- Reset Password.

---

# 5. Dashboard

## 5.1 Overview

The Dashboard is the main workspace after authentication.

It should provide a quick overview of the freelancer's business activity.

## 5.2 Header

Include:

- Personalized welcome message.
- Current date.
- Quick action buttons.

Quick Actions:

- Create Contact.
- Create Deal.
- Create Task.

## 5.3 KPI Cards

Required cards:

1. Total Contacts.
2. Active Deals.
3. Total Pipeline Value.
4. Won Deals.

Definitions:

- Total Pipeline Value represents the value of currently active deals.
- Won Revenue represents successfully closed deals.
- Won Deals counts deals with Won status.

## 5.4 Analytics

Dashboard analytics include:

- Revenue over time.
- Deals by stage.
- Contact growth.
- Deal conversion rate.

Default analytics range: Last 90 Days.

Use Hairline Charts for chart components.

## 5.5 Additional Dashboard Sections

- Pipeline Overview.
- Recent Deals.
- Recent Contacts.
- Recent Activities.
- Upcoming Tasks.

Dashboard data must be based on actual authenticated user records.

Any prototype or seed data must be clearly identified as demo data.

---

# 6. Contact Management

## 6.1 Overview

Contacts represent the people the freelancer interacts with professionally.

## 6.2 Contact Types

- Lead.
- Client.
- Former Client.
- Partner.

## 6.3 Contact Fields

| Field | Required |
|---|---|
| First Name | Yes |
| Last Name | Yes |
| Email | No |
| Phone | No |
| Company | No |
| Contact Type | Yes |
| Job Title | No |
| Tags | No |
| Website | No |
| Notes | No |

Each contact can belong to zero or one company.

A company may have multiple contacts.

## 6.4 Contacts List

Support:

- Table View.
- Grid View.
- Search.
- Filters.
- Sorting.
- Pagination.
- Row Selection.
- Bulk Actions.

Table columns:

- Contact: Avatar, Name, Email.
- Company.
- Type.
- Deals Count.
- Last Activity.
- Added Date.
- Actions.

Filters:

- Contact Type.
- Company.
- Tags.
- Date Added.

Sorting:

- Name.
- Recently Added.
- Last Activity.

## 6.5 Contact Profile

Dedicated Contact Details page.

Sections:

- Profile Header.
- Overview.
- Deals.
- Tasks & Follow-ups.
- Activity Timeline.

The profile should provide quick actions to:

- Edit Contact.
- Delete Contact.
- Create Deal.
- Create Task.
- Add Activity.

## 6.6 Contact Form

Use a reusable Add/Edit Contact form.

Technology:

- React Hook Form.
- Zod.
- Hairline UI form components.

## 6.7 Contact Deletion Rules

When deleting a contact:

- Delete the Contact.
- Delete associated Tasks and Follow-ups.
- Delete associated Activities.
- Retain associated Deals.
- Set `primaryContact` to `null` in retained Deals.
- Preserve Deal History.

Important: Commercial deal information must not be lost when a contact is deleted.

---

# 7. Company Management

## 7.1 Overview

Companies represent organizations associated with contacts and business opportunities.

One company can have multiple contacts.

Each contact can belong to one company or no company.

## 7.2 Company Fields

| Field | Required |
|---|---|
| Company Name | Yes |
| Website | No |
| Industry | No |
| Email | No |
| Phone | No |
| Address | No |
| Description | No |
| Company Size | No |
| Annual Revenue | No |
| LinkedIn URL | No |
| Company Logo | No |

Annual Revenue is stored as a numeric USD value.

## 7.3 Industry Options

- Technology.
- Finance.
- Healthcare.
- Education.
- Marketing.
- E-commerce.
- Real Estate.
- Manufacturing.
- Consulting.
- Other.

## 7.4 Company Size Options

- Self-employed.
- 1–10 Employees.
- 11–50 Employees.
- 51–200 Employees.
- 201–500 Employees.
- 501–1000 Employees.
- 1000+ Employees.

## 7.5 Company List

Support:

- Table View.
- Grid View.
- Search.
- Filters.
- Sorting.
- Pagination.
- Bulk Selection.

Statistics:

- Total Companies.
- Total Contacts.
- Active Deals.
- Total Deal Value.

Table columns:

- Company: Logo and Name.
- Industry.
- Company Size.
- Contacts Count.
- Active Deals.
- Total Deal Value.
- Added Date.
- Actions.

Filters:

- Industry.
- Company Size.
- Number of Contacts.
- Date Added.

Sorting:

- Name.
- Recently Added.
- Deal Value.

Bulk Actions:

- Delete Selected.
- Export Selected.

## 7.6 Company Logo

Two options:

1. User-uploaded image.
2. Generated avatar using the first two letters of the company name.

## 7.7 Company Duplicate Detection

When creating a company with a potentially duplicated name:

- Show a warning.
- Allow the user to continue.
- Do not hard-block the operation.

## 7.8 Company Profile

Dedicated Company Details page.

Header:

- Company Logo.
- Company Name.
- Industry.
- Website.
- Company Size.
- Edit.
- Delete.
- Quick Actions.

Tabs:

1. Overview.
2. Contacts.
3. Deals.
4. Activities.
5. Notes.

Overview:

Display available company information and hide empty optional fields.

Contacts:

- Table View only.
- Add Contact.
- Automatically associate the new contact with the current company.

Deals:

- Display associated deals.
- Allow opening Deal Details.

Activities:

- Display company activities.
- Include activities associated with the company's contacts and deals.
- Clearly identify the original activity source.

Notes:

- Notes are implemented using Activity records of type `Note`.
- No separate Notes entity.

## 7.9 Company Form

Use a Side Sheet for creating and editing companies.

The form includes all defined company fields.

## 7.10 Company Deletion Rules

When deleting a company:

- Delete the Company only.
- Retain its Contacts and set their company reference to `null`.
- Retain its Deals and set their company reference to `null`.
- Preserve historical Activities and Deal History.
- Do not cascade-delete associated historical records.

---

# 8. Deal Management

## 8.1 Overview

Deals represent business opportunities and potential revenue.

Users can track opportunities through a customizable pipeline.

## 8.2 Deal Fields

| Field | Required |
|---|---|
| Deal Name | Yes |
| Deal Value | Yes |
| Primary Contact | Yes on creation |
| Associated Company | No |
| Pipeline Stage | Yes |
| Probability | No |
| Expected Closing Date | No |
| Description | No |

Rules:

- Deal Value must be greater than zero.
- Probability defaults based on the selected stage.
- Users can manually override probability.
- Associated Company is initially populated from the selected contact's company.
- Users can change the associated company manually.
- A deal may be associated with a company different from the primary contact's company.
- One contact can be associated with multiple deals.

## 8.3 Pipeline Stages

Default stages:

1. New.
2. Qualified.
3. Proposal.
4. Negotiation.

Users can:

- Add stages.
- Rename stages.
- Reorder stages.
- Change stage colors.
- Delete stages.

Won and Lost are terminal statuses, not ordinary pipeline stages.

## 8.4 Kanban Pipeline

Support drag-and-drop between ordinary stages.

Each stage header displays:

- Stage Name.
- Number of Deals.
- Total Deal Value.
- Add Deal action.

Each deal card displays:

- Deal Name.
- Contact Name.
- Company Name.
- Deal Value.
- Probability.
- Expected Closing Date.

Won and Lost are presented as visually distinguished final columns.

Require confirmation when moving a deal to Won or Lost.

## 8.5 Deal List

Support:

- Table View.
- Kanban View.
- Search.
- Filters.
- Sorting.
- Pagination.
- Bulk Actions.

Statistics:

- Total Deals.
- Active Deals.
- Pipeline Value.
- Won Revenue.
- Lost Deals.

Table columns:

- Deal Name.
- Primary Contact.
- Company.
- Value.
- Stage.
- Probability.
- Expected Closing Date.
- Status.
- Actions.

Filters:

- Stage.
- Status.
- Contact.
- Company.
- Deal Value.
- Expected Closing Date.
- Probability.

Sorting:

- Highest Value.
- Lowest Value.
- Recently Created.
- Expected Closing Date.
- Highest Probability.

Bulk Actions:

- Delete Selected.
- Change Stage.
- Export Selected.

## 8.6 Deal Statuses

- Open.
- Won.
- Lost.

## 8.7 Closing a Deal

When marking a deal as Won:

- Record Actual Closing Date.
- Record Final Deal Value.
- Create Deal History entry.
- Set status to Won.

When marking a deal as Lost:

- Record Lost Date.
- Optionally record Lost Reason.
- Create Deal History entry.
- Set status to Lost.

Lost Reason options:

- Price.
- Competitor.
- No Response.
- Not Interested.
- Budget Issues.
- Other.

## 8.8 Reopening Deals

Users can reopen Won or Lost deals.

A reopened deal returns to its last ordinary pipeline stage before closing.

A Won deal's value cannot be edited while it remains closed. The user must reopen it first.

## 8.9 Deal Stage Deletion

If a stage contains deals:

- Require the user to select a replacement stage.
- Move affected deals to that stage.
- Do not delete deals automatically.

## 8.10 Deal Details

Dedicated Deal Details page.

Sections:

- Deal Overview.
- Primary Contact.
- Associated Company.
- Value and Probability.
- Pipeline Stage.
- Expected Closing Date.
- Description.
- Activity Timeline.
- Related Tasks.
- Deal History.

Timeline includes:

- Deal Activities.
- Primary Contact Activities.
- Clear activity source labels.

## 8.11 Deal History

Maintain important commercial events independently from Contact Activities.

Record:

- Deal Created.
- Stage Changed.
- Value Updated.
- Deal Won.
- Deal Lost.
- Deal Reopened.

Deal History must remain available even if the original Contact is deleted.

## 8.12 Deal Form

Use a Side Sheet for Add/Edit Deal.

The Contact selector must be searchable and provide an option to create a new contact without leaving the workflow.

---

# 9. Tasks and Follow-ups

## 9.1 Overview

Tasks help freelancers organize work and ensure important actions are completed on time.

Two task types:

- Regular Task.
- Follow-up.

Calls and Meetings are Activities, not Task Types.

## 9.2 Task Fields

Recommended task structure:

- Title — Required.
- Description — Optional.
- Type — Regular Task / Follow-up.
- Status.
- Priority.
- Due Date — Optional.
- Due Time — Optional.
- Related Entity — Optional.
- Reminder.
- Created Date.
- Completed Date.

Related Entity can be one of:

- Contact.
- Deal.
- Company.

A task can only be associated with one entity at a time.

## 9.3 Task Priority

- Low.
- Medium.
- High.

No Urgent priority in the MVP.

## 9.4 Task Status

- To Do.
- In Progress.
- Completed.
- Cancelled.

## 9.5 Task Management

Provide a dedicated Tasks page.

Recommended views:

- Table/List View.
- Calendar View through the Calendar module.

Task features:

- Create.
- Edit.
- Delete.
- Complete.
- Change Priority.
- Search.
- Filter.
- Sort.
- Bulk Actions.

Filters:

- Status.
- Priority.
- Type.
- Due Date.
- Related Entity.

Sorting:

- Due Date.
- Priority.
- Recently Created.

Bulk Actions:

- Complete Selected.
- Delete Selected.
- Change Priority.

Overdue tasks must be visually distinguishable.

## 9.6 Task Details

Open task details in a Side Sheet.

Allow editing, completion, cancellation, and deletion.

When completed, store the completion timestamp.

## 9.7 Follow-ups

Follow-ups are specialized tasks used to track future communication or actions related to a professional relationship.

They share the Task structure and support the same status and priority rules.

## 9.8 Reminders

- Default reminder: One day before the Due Date.
- Tasks without a Due Date do not receive reminders.
- Reminders are delivered through the in-app Notification Center.
- No external email or push delivery in the MVP.

## 9.9 Recurring Tasks

Deferred to a future phase.

---

# 10. Calendar

## 10.1 Calendar Views

Support:

- Monthly.
- Weekly.
- Daily.

Monday is the first day of the week.

## 10.2 Calendar Events

Display:

- Tasks.
- Follow-ups.
- Meetings.
- Calls.

Use visually distinct colors for each event type.

Meetings and Calls are Activity records with scheduled date/time information.

## 10.3 Calendar Interactions

- Navigate between dates.
- Switch calendar views.
- Create a Task from a selected date.
- Create a Follow-up from a selected date.
- Open existing event details.
- Reschedule supported events through drag-and-drop.

## 10.4 External Synchronization

Google Calendar and other external integrations are not included in the MVP.

---

# 11. Activity Management

## 11.1 Activity Types

- Note.
- Call.
- Email.
- Meeting.

## 11.2 Activity Fields

Recommended structure:

- Type.
- Title.
- Description / Content.
- Related Contact.
- Related Deal.
- Related Company.
- Activity Date.
- Scheduled Date/Time when applicable.
- Created At.
- Updated At.

An activity can be associated with its relevant CRM context.

## 11.3 Activity Operations

Users can:

- Create Activities.
- Edit Activities.
- Delete Activities.

Activities can be created from:

- Contact Profile.
- Company Profile.
- Deal Details.

## 11.4 Activity Timeline

Each Contact, Company, and Deal has its own Activity Timeline.

When displaying related activities across entities:

- Preserve the original activity.
- Display it in the relevant related timelines.
- Identify its source clearly.
- Avoid duplicating the underlying Activity record.

Historical Activities should not be cascade-deleted when a Company is deleted.

Contact deletion follows the explicit Contact deletion rules defined earlier.

---

# 12. Notification Center

## 12.1 Overview

Relio includes an in-app notification system.

## 12.2 Notification Types

- Upcoming Task Reminders.
- Overdue Tasks.
- Upcoming Follow-ups.
- Deal Won.
- Deal Lost.
- Approaching Deal Closing Dates.

## 12.3 User Interface

- Notification Bell in the application Navbar.
- Notification Dropdown.
- Dedicated Notifications page.
- Unread count.
- Mark as Read.
- Mark as Unread.
- Mark All as Read.

## 12.4 Delivery

In-app notifications only.

Email and Push Notifications are deferred.

---

# 13. Settings

## 13.1 Profile Settings

- Username.
- Profile Avatar.
- Basic Profile Information.

## 13.2 Security Settings

- Change Password.
- Delete Account.

Change Email is not included.

## 13.3 Preferences

- Light Mode.
- Dark Mode.
- System Theme.
- Notification Preferences.
- Default Currency.

Default currency: USD.

Currency conversion and multi-currency support are not included in the MVP.

---

# 14. Global Search

## 14.1 Overview

Provide a global search interface accessible from anywhere in the authenticated application.

## 14.2 Shortcut

`Ctrl + K`

## 14.3 Searchable Entities

- Contacts.
- Companies.
- Deals.
- Tasks.

## 14.4 UX Requirements

- Keyboard-accessible.
- Search results grouped by entity type.
- Quick navigation to matching records.
- Loading and empty states.
- Search must respect user ownership and authorization.

---

# 15. CSV Export

Allow users to export relevant CRM records.

Initial supported entities:

- Contacts.
- Companies.
- Deals.
- Tasks.

Requirements:

- Export selected records where applicable.
- Respect active filters and selection.
- Use meaningful column headers.
- Format dates consistently.
- Export monetary values as numeric values.
- Never expose records belonging to another user.

CSV Import is deferred.

---

# 16. Onboarding Wizard

New users should receive an optional onboarding experience.

Requirements:

- Introduce the main capabilities.
- Explain how to create contacts and companies.
- Explain deal pipeline management.
- Introduce task and follow-up management.
- Provide a way to create initial demo data or sample records.
- Allow skipping onboarding.
- Allow removing demo data.

Do not force the user to complete onboarding before accessing the application.

---

# 17. Application Navigation

Recommended authenticated navigation:

1. Overview.
2. Contacts.
3. Companies.
4. Deals.
5. Tasks.
6. Calendar.
7. Activities.
8. Notifications.
9. Settings.

The application layout includes:

- Sidebar.
- Top Navbar.
- Main Content Area.
- Global Search.
- Notification Access.
- User Profile Menu.

Navigation must be responsive and support a mobile-friendly layout.

---

# 18. Marketing Website / Landing Page

## 18.1 Objective

The public Landing Page introduces Relio, communicates its value, explains its features, and encourages visitors to register.

## 18.2 Landing Page Sections

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

## 18.3 Design Requirements

- Premium SaaS visual identity.
- Clear typography.
- Strong visual hierarchy.
- Product-focused illustrations and screenshots.
- Subtle background variations.
- Responsive layout.
- Accessible components.
- Clear calls to action.

## 18.4 Content Integrity

Never fabricate real testimonials, customer counts, performance metrics, or business results.

Demo content must be presented as illustrative content until genuine data is available.

## 18.5 Pricing

The pricing section can present the initial product offering.

However, subscription checkout and billing are not part of the MVP.

---

# 19. Design System and Visual Direction

## 19.1 Design Philosophy

Relio should feel like a premium, modern, well-crafted SaaS product.

The visual direction should prioritize:

- Clarity.
- Consistency.
- Usability.
- Professionalism.
- Visual hierarchy.
- Efficient workflows.
- High-quality spacing and typography.

Avoid unnecessary visual decoration.

## 19.2 UI Libraries

Primary UI foundation:

- Hairline UI.
- shadcn/ui conventions.
- Tailwind CSS v4.

Hairline UI should be the primary source of UI components.

Use its official CLI and installed MCP integration to discover and implement supported components.

Do not create redundant components when a suitable Hairline component already exists.

## 19.3 Design Tokens

Use Hairline UI's default design system as the starting point.

Customize through semantic CSS variables rather than scattered hardcoded colors.

Brand direction:

- Primary Accent: Blue.
- Light Theme.
- Dark Theme.
- System Theme.

Keep both themes visually cohesive.

Do not create unrelated colors for individual components.

## 19.4 Typography

Primary typography:

**Inter Tight**

Usage:

- Headings.
- Body Text.
- Navigation.
- Buttons.
- Form Labels.
- General UI.

Technical monospace contexts:

Use the platform's monospace fallback only where monospaced text is required.

Usage:

- Code and technical identifiers that benefit from monospaced alignment.

Before installing or configuring fonts, inspect Hairline UI defaults and avoid duplicate font dependencies.

## 19.5 Layout System

Use a consistent spacing and sizing system.

Application Layout:

- Sidebar navigation.
- Top navigation.
- Main content container.
- Responsive content width.
- Consistent page headers.
- Reusable action areas.

Dashboard Layout:

- Welcome section.
- Quick actions.
- KPI grid.
- Analytics grid.
- Pipeline section.
- Recent activity sections.

List Pages:

- Page Header.
- Statistics where applicable.
- Search and Filters.
- View Toggle.
- Data Table or Grid.
- Pagination.
- Bulk Actions.

Details Pages:

- Breadcrumbs.
- Entity Header.
- Quick Actions.
- Information Sections.
- Related Records.
- Activity Timeline.

Forms:

- Use Side Sheets as the preferred pattern for Add/Edit Contact, Company, and Deal.
- Use reusable form components.
- Provide validation feedback.
- Keep fields logically grouped.

## 19.6 Components

Create reusable components for:

- Page Headers.
- Stat Cards.
- Search Inputs.
- Filter Controls.
- Data Tables.
- View Toggles.
- Empty States.
- Loading States.
- Error States.
- Confirmation Dialogs.
- Side Sheets.
- Form Fields.
- Activity Timelines.
- Entity Avatars.
- Status Badges.
- Priority Indicators.

Use Hairline components where available.

## 19.7 Illustrations and Images

Use Hairline SVG Illustration Library:

`@lucasmarkes/hairline`

It provides 2D isometric SVG illustrations.

Use illustrations in:

- Landing Page.
- Empty States.
- Onboarding Wizard.

Combine illustrations with appropriate product imagery and screenshots.

Do not introduce a 3D graphics engine.

## 19.8 Animation

No animation library is required.

Allowed:

- Simple CSS transitions.
- Hover effects.
- Focus transitions.
- Subtle state changes.

Avoid:

- Framer Motion.
- GSAP.
- Three.js.
- React Three Fiber.

## 19.9 Charts

Use Hairline Charts.

Charts should:

- Display actual backend data.
- Have clear labels.
- Support responsive sizing.
- Provide empty states when no data exists.
- Avoid misleading visualizations.

---

# 20. Technical Architecture

## 20.1 Monorepo

Repository name: `Relio`

Structure:

```text
Relio/
├── apps/
│   ├── client/
│   └── server/
│
├── packages/
│   └── shared/
│
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json
├── .gitignore
└── README.md
```

## 20.2 Frontend Stack

- React 19.
- Vite.
- TypeScript.
- Tailwind CSS v4.
- Hairline UI.
- shadcn/ui conventions.
- React Router.
- TanStack Query.
- React Hook Form.
- Zod.
- Zustand.
- Hairline Charts.
- Hairline SVG Illustrations.

## 20.3 Frontend Architecture

Organize frontend by application foundation, reusable components, and feature modules.

Suggested structure:

```text
apps/client/src/
├── app/
│   ├── providers/
│   ├── router/
│   └── layouts/
│
├── components/
│   ├── ui/
│   └── shared/
│
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
│
├── hooks/
├── lib/
├── styles/
└── types/
```

Each feature should contain its own components, hooks, schemas, API functions, and types where appropriate.

Do not place the entire application inside a single page component.

## 20.4 Backend Stack

- Node.js.
- Express 5.
- TypeScript.
- MongoDB Atlas.
- Mongoose.
- JWT.
- Secure HTTP-only Cookies.

## 20.5 Backend Architecture

Use a Modular Monolith.

Suggested structure:

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
│
├── shared/
│   ├── errors/
│   ├── types/
│   ├── utils/
│   └── validators/
│
├── app.ts
└── server.ts
```

Each module should own its routes, controllers, services, validation schemas, and data models where appropriate.

Avoid unnecessary abstraction layers.

## 20.6 Shared Package

`packages/shared` should contain reusable code genuinely shared between frontend and backend.

Potential contents:

- Shared TypeScript types.
- Common enums.
- Shared validation schemas where compatible.
- Shared constants.

Avoid moving backend-only or frontend-only logic into this package.

## 20.7 Development Ports

Frontend:

`http://localhost:3000`

Backend:

`http://localhost:5000`

Health Endpoint:

`GET http://localhost:5000/api/v1/health`

## 20.8 Root Commands

The root package should support:

```bash
pnpm dev
pnpm dev:client
pnpm dev:server
pnpm build
pnpm lint
pnpm typecheck
```

`pnpm dev` should run the frontend and backend concurrently.

---

# 21. Data Model and Relationship Requirements

The final Mongoose schemas must respect the following entity relationships.

## 21.1 Main Entities

- User.
- Contact.
- Company.
- Deal.
- PipelineStage.
- Task.
- Activity.
- DealHistory.
- Notification.

## 21.2 Relationship Overview

- User → Many Contacts.
- User → Many Companies.
- User → Many Deals.
- User → Many Tasks.
- User → Many Activities.
- User → Many Notifications.
- Company → Many Contacts.
- Contact → Zero or One Company.
- Contact → Many Deals as Primary Contact.
- Deal → Zero or One Primary Contact after Contact deletion.
- Deal → Zero or One Company.
- Deal → One Pipeline Stage while Open.
- Deal → Many Tasks.
- Contact → Many Tasks.
- Company → Many Tasks.
- Contact / Company / Deal → Related Activities.
- Deal → Many Deal History Records.

## 21.3 Data Integrity

- Every user-owned record must have an owner.
- References must be validated.
- All relationships must respect ownership.
- Deletion behavior must follow the explicit business rules.
- Historical deal records must not disappear when contacts are deleted.
- Company deletion must not remove contacts, deals, or historical activities.
- Deal stage deletion must require reassignment.
- Use indexes for frequently queried fields.
- Avoid unnecessary data duplication.

The implementation phase must finalize exact schema shapes, indexes, validation, and deletion transactions before building the related modules.

---

# 22. API and Backend Requirements

Use REST API conventions.

Base API path:

`/api/v1`

Recommended API module boundaries:

- `/auth`
- `/users`
- `/contacts`
- `/companies`
- `/deals`
- `/pipeline-stages`
- `/tasks`
- `/activities`
- `/notifications`
- `/dashboard`
- `/search`
- `/exports`

Requirements:

- Consistent response format.
- Centralized error handling.
- Request validation.
- Authentication middleware.
- Ownership authorization.
- Pagination.
- Filtering.
- Sorting.
- Search.
- Safe file handling.
- Appropriate HTTP status codes.

All business rules must be enforced on the backend, not only through frontend validation.

---

# 23. Non-Functional Requirements

## 23.1 Performance

- Avoid unnecessary re-renders.
- Use pagination for large datasets.
- Optimize database queries.
- Add indexes where justified.
- Use lazy loading where appropriate.
- Avoid loading unrelated data on every page.
- Keep bundle size reasonable.

## 23.2 Security

- Secure authentication.
- Password hashing.
- HTTP-only cookies.
- Input validation.
- Ownership authorization.
- CORS configuration.
- Rate limiting.
- Secure environment variables.
- Safe error responses.
- File upload validation.
- Protection against unauthorized data access.

## 23.3 Accessibility

- Semantic HTML.
- Keyboard navigation.
- Visible focus states.
- Accessible forms.
- Accessible dialogs and side sheets.
- Proper contrast.
- Appropriate labels and descriptions.
- Reduced-motion consideration.

## 23.4 Responsive Design

Support:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

All primary CRM workflows must remain usable on smaller screens.

## 23.5 Maintainability

- Strict TypeScript.
- Modular architecture.
- Consistent naming conventions.
- Reusable components.
- Feature-based organization.
- Clear separation of concerns.
- No oversized components or files.
- Avoid premature abstractions.

---

# 24. Testing and Quality Assurance

Testing should be introduced progressively.

## 24.1 Frontend

- Component testing.
- Form validation testing.
- UI interaction testing.
- Routing testing.
- Error and loading state testing.

## 24.2 Backend

- API endpoint testing.
- Authentication testing.
- Authorization testing.
- Business rule testing.
- Database relationship testing.
- Deletion behavior testing.

## 24.3 Critical Test Scenarios

- User A cannot access User B's records.
- Deleting a Contact retains associated Deals.
- Deleting a Company retains Contacts and Deals.
- Deleting a Pipeline Stage requires reassignment.
- Won Deals cannot have their value edited until reopened.
- Overdue Tasks are identified correctly.
- Tasks without Due Dates do not generate reminders.
- Notifications belong to the correct user.
- CSV exports never include another user's records.

---

# 25. Development Roadmap

The project must be developed in controlled phases.

## Phase 1 — Monorepo Initialization

Objectives:

- Create repository.
- Configure pnpm Workspaces.
- Initialize frontend and backend.
- Configure TypeScript.
- Configure root scripts.
- Configure Git and `.gitignore`.
- Configure ESLint and Prettier.
- Verify the basic development environment.

Deliverable: A working monorepo foundation.

## Phase 2 — Frontend Foundation and Design System

Objectives:

- Configure Hairline UI.
- Configure shadcn conventions.
- Configure Tailwind CSS v4.
- Configure typography.
- Establish semantic design tokens.
- Implement Light and Dark Themes.
- Create application layouts.
- Configure React Router.
- Configure TanStack Query.
- Prepare reusable components.
- Configure responsive navigation.

Deliverable: A consistent, reusable UI foundation.

## Phase 3 — Backend Foundation

Objectives:

- Configure Express.
- Configure environment validation.
- Configure MongoDB Atlas connection.
- Add centralized error handling.
- Configure CORS.
- Configure security middleware.
- Add health-check endpoint.
- Prepare modular backend architecture.

Deliverable: A stable backend foundation.

## Phase 4 — Database Design

Objectives:

- Define Mongoose schemas.
- Define entity relationships.
- Define indexes.
- Define validation rules.
- Define ownership rules.
- Define deletion behavior.
- Define Deal History rules.

Deliverable: A documented and validated database model.

## Phase 5 — Authentication

Objectives:

- Registration.
- Login.
- Logout.
- Google OAuth.
- Forgot Password.
- Reset Password.
- Protected Routes.
- Session handling.
- Authorization middleware.

Deliverable: Secure authenticated application access.

## Phase 6 — Core CRM Modules

Recommended implementation order:

1. Contacts.
2. Companies.
3. Pipeline Stages.
4. Deals.
5. Tasks and Follow-ups.
6. Activities.

Each module must include:

- Backend API.
- Database integration.
- Frontend UI.
- Forms and validation.
- Loading, Empty, Error, and Success states.
- Authorization.
- Testing.

Deliverable: Fully functional core CRM.

## Phase 7 — Calendar and Notifications

Objectives:

- Calendar Views.
- Calendar Events.
- Task Reminders.
- Overdue Notifications.
- Deal Notifications.
- Notification Center.

Deliverable: Working scheduling and in-app notification experience.

## Phase 8 — Dashboard and Analytics

Objectives:

- Dashboard KPIs.
- Revenue Charts.
- Pipeline Analytics.
- Contact Growth.
- Conversion Metrics.
- Recent Records.

Deliverable: Real-time business overview based on user data.

## Phase 9 — Marketing Website and Onboarding

Objectives:

- Public Landing Page.
- Feature Sections.
- Pricing Presentation.
- FAQ.
- Registration CTAs.
- Onboarding Wizard.
- Demo Data Support.

Deliverable: Complete public product experience.

## Phase 10 — Final QA and Deployment

Objectives:

- End-to-end testing.
- Security review.
- Performance review.
- Responsive testing.
- Accessibility review.
- Production configuration.
- Deployment.
- Documentation.

Deliverable: Production-ready Relio MVP.

---

# 26. Future Roadmap

Potential future releases:

## Version 1.1

- Recurring Tasks.
- CSV Import.
- More Advanced Analytics.
- Additional Custom Fields.
- More Advanced Pipeline Configuration.

## Version 1.2

- Email Integration.
- Automated Email Reminders.
- Google Calendar Synchronization.
- External Notifications.

## Version 2.0

- AI-powered Client Insights.
- Automated Workflow Suggestions.
- Subscription and Billing.
- Additional Productivity Integrations.

These releases are proposals, not MVP commitments.

---

# 27. Definition of Done

A feature is not considered complete merely because its UI exists.

Every feature must satisfy the following:

1. UI implemented according to the design system.
2. Responsive behavior verified.
3. Frontend validation implemented.
4. Backend validation implemented.
5. API integration completed.
6. Database persistence working.
7. Ownership authorization verified.
8. Loading, Empty, Error, and Success states handled.
9. Business rules implemented.
10. Important scenarios tested.
11. TypeScript checks pass.
12. No known blocking issues remain.

---

# 28. Project-Wide Engineering Rules

These rules apply to every development phase and every AI coding agent working on Relio.

- Read the PRD before implementing a feature.
- Inspect the existing codebase before modifying files.
- Follow the established folder structure.
- Do not rewrite working code unnecessarily.
- Do not introduce a new library without a clear reason.
- Prefer Hairline UI components when available.
- Use shadcn conventions consistently.
- Use Tailwind CSS v4.
- Use semantic design tokens.
- Do not hardcode arbitrary colors throughout components.
- Keep components focused and reusable.
- Separate business logic from presentation.
- Keep API calls out of UI components.
- Use TanStack Query for Server State.
- Use Zustand for Client State when needed.
- Use React Hook Form and Zod for forms.
- Enforce business rules on the backend.
- Never trust frontend ownership information.
- Do not implement features outside the current development phase.
- Do not use fake backend responses to simulate completed features.
- Do not add unnecessary dependencies.
- Verify changes with relevant checks.
- Document important architectural decisions.

---

# 29. Current Project Status

**Current Phase: Phase 2 — Frontend Foundation & Design System**

Phase 1 — Monorepo Initialization & Project Foundation is complete. Its
implementation and validation record is maintained in `docs/PROGRESS.md`.

The next milestone is Phase 2, Milestone 2.10 — Responsive & Accessibility Foundation. Do not
begin Phase 3 until Phase 2 is complete and the user instructs you to continue.

---

# Final Product Principle

Relio should not become an unnecessarily complicated CRM.

The goal is to build a polished, reliable, maintainable, and genuinely useful tool for independent professionals.

Every feature must have a clear purpose, every relationship must preserve data integrity, and every part of the interface must make the freelancer's daily workflow easier.

**Build Relio as a real product, not just a portfolio UI.**