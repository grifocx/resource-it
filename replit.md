# IT Resource Management Application - v2.0

## Overview

This IT Resource Management application tracks resource allocation, manages work items (demands, projects, and operations & maintenance tasks), and visualizes team capacity. It helps managers and team leads prioritize work, forecast resource needs, and prevent team member burnout through capacity planning.

Key capabilities include:
- Team and team member management with skill tracking
- Type-specific work item tracking with workflow-based status management
- Allocation-based capacity forecasting and real-time visualization
- Comprehensive reporting for resource utilization and work pipeline visibility
- Availability management for out-of-office tracking

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The application utilizes React 18 with TypeScript, Wouter for routing, and Shadcn/ui (New York style) with Radix UI primitives for its component library. The design follows Fluent Design principles, emphasizing clarity and efficiency for information-dense workflows. Styling is managed with Tailwind CSS, supporting light and dark modes with custom theming.

### Technical Implementations

- **Frontend**: React 18, TypeScript, Vite, Wouter for routing, TanStack Query for server state management, React Hook Form with Zod for form handling.
- **Backend**: Node.js with Express.js for REST APIs.
- **Data Layer**: Drizzle ORM with PostgreSQL (via Neon serverless driver).
- **Validation**: Zod schemas are shared between client and server for type safety and consistent validation, including type-specific status workflows.
- **Development**: Custom Vite integration for HMR and seamless full-stack development.
- **Production**: Separate builds for client (Vite) and server (esbuild).

### Feature Specifications

- **Work Item Management**: Supports Demands, Projects, and O&M with distinct, workflow-based status systems (e.g., Demands: Draft → Submitted → Screened → Qualified → Approved → Complete; Projects: Initiating → Planning → Executing → Delivering → Closing; O&M: Planned → Active → On Hold → Completed). Statuses are color-coded and type-specific.
- **Reporting**: Includes a Resource Utilization Report (team capacity, overallocation alerts, allocation breakdown) and a Work Pipeline Report (work item flow analysis, unallocated backlog).
- **Capacity Planning**: Focuses on forward-looking allocations to calculate `allocatedHours`, `availableHours`, and `capacityPercentage` for team members and work items.

### System Design Choices

- **Monorepo Structure**: Organized with client, server, and shared code in a single repository using TypeScript path aliases.
- **Shared Types**: TypeScript types and Zod schemas are centralized in a `/shared` directory for consistency across the stack.
- **Database Schema**:
    - `teams`: Organizational units.
    - `team_members`: Individual contributors with skills, weekly hours, and team assignments.
    - `work_items`: Tracks demands, projects, and O&M tasks with type-specific statuses.
    - `allocations`: Forecasts resource commitments, linking team members to work items with weekly hours and date ranges.
    - `out_of_office`: Tracks availability with date ranges and reasons.
- **Relationships**: Team members belong to teams, allocations link team members to work items, out-of-office entries belong to team members.
- **Migrations**: Drizzle Kit is used for schema migrations.

## External Dependencies

- **Server State Management**: `@tanstack/react-query`
- **ORM**: `drizzle-orm`
- **Database Driver**: `@neondatabase/serverless` (for PostgreSQL)
- **Form Handling**: `react-hook-form`
- **Validation**: `zod`
- **UI Primitives**: `@radix-ui/*`
- **Component Library**: `shadcn/ui`
- **Icons**: `lucide-react`
- **CSS Framework**: `tailwindcss`
- **Styling Utility**: `class-variance-authority`
- **Build Tool**: `vite`
- **TypeScript**: `typescript`
- **Bundler**: `esbuild`
- **DB Migration Tool**: `drizzle-kit`
- **Routing**: `wouter`
- **Date Utilities**: `date-fns`
- **Session Storage**: `connect-pg-simple` (installed but not actively used for authentication)
- **WebSockets**: `ws`