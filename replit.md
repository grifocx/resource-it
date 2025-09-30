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
- **Capacity Planning**: Interactive drag-and-drop prioritization board with four priority levels (Critical, High, Normal, Low). Work items can be reprioritized with database persistence. Displays real allocation data (hours per week, assigned team members) for each work item.
- **Allocation Forecasting**: Focuses on forward-looking allocations to calculate `allocatedHours`, `availableHours`, and `capacityPercentage` for team members and work items.

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

## Version 2.0 Implementation

### Implemented Features

**Type-Specific Work Item Management**:
- ✅ Three distinct work item types (Demands, Projects, O&M) with dedicated workflow statuses
- ✅ Dynamic status validation based on work item type using Zod schemas
- ✅ Comprehensive color-coding system for statuses and types throughout the UI
- ✅ Status dropdowns that automatically adapt to the selected work item type

**Comprehensive Reporting**:
- ✅ **Resource Utilization Report**: Team capacity overview, overallocation alerts, allocation breakdown by work type
- ✅ **Work Pipeline Report**: Work item flow analysis by type and status, unallocated backlog identification
- ✅ Real-time metrics including allocated hours, capacity percentages, and risk indicators
- ✅ Tab-based interface for easy navigation between reports

**Interactive Capacity Planning**:
- ✅ Drag-and-drop prioritization board with four priority levels (Critical, High, Normal, Low)
- ✅ Real-time display of work items with actual allocation data
- ✅ Database persistence of priority changes via API mutations
- ✅ Visual indicators showing hours per week and number of assigned team members per work item
- ✅ Type-specific color coding consistent across the application

### Future Enhancements

**Planned Features**:
- Authentication & role-based access control
- Advanced trend analysis and forecasting reports
- External integrations (Linear, GitHub, Calendar sync)
- Skills-based allocation matching
- Work item dependencies and critical path visualization
- Customizable dashboard widgets
- Mobile experience and PWA capabilities