# IT Resource Management Application

## Overview

This is an IT Resource Management application designed to help teams track resource allocation, manage work items (demands, projects, and operations & maintenance tasks), and visualize team capacity. The application enables managers and team leads to prioritize work, forecast resource needs, and prevent team member burnout through capacity planning.

Key features include:
- Team and team member management with skill tracking
- Work item tracking (demands, projects, O&M tasks)
- Resource allocation and capacity planning
- Time tracking and availability management
- Priority-based work organization
- Real-time capacity visualization

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing, supporting pages for Dashboard, Teams, Team Members, Work Items, Priorities, and Availability management.

**UI Component Library**: Shadcn/ui (New York style) with Radix UI primitives. The application uses a comprehensive set of pre-built components including dialogs, forms, cards, dropdowns, and data tables. Components are organized in `client/src/components/ui/`.

**Design System**: Fluent Design principles optimized for productivity and information-dense enterprise applications. The application emphasizes clarity, efficiency, and professional aesthetics suitable for daily operational use.

**Styling**: Tailwind CSS with custom theming supporting light and dark modes. CSS variables are used extensively for theme customization, with design tokens for colors, spacing, and typography defined in `client/src/index.css`.

**State Management**: TanStack Query (React Query) for server state management, providing caching, background updates, and optimistic updates. Query client configured with infinite stale time and disabled refetch behaviors for predictable data loading.

**Form Handling**: React Hook Form with Zod schema validation for type-safe form submissions. Form components integrate with the validation schemas defined in the shared schema layer.

### Backend Architecture

**Runtime**: Node.js with Express.js framework for REST API endpoints.

**API Design**: RESTful endpoints following resource-based conventions:
- `/api/teams` - Team CRUD operations
- `/api/team-members` - Team member management
- `/api/work-items` - Work item tracking
- `/api/allocations` - Resource allocation forecasts
- `/api/out-of-office` - Availability tracking

**Data Layer**: Storage abstraction pattern with interface-based design (`IStorage`) allowing for implementation flexibility. Current implementation uses Drizzle ORM with PostgreSQL.

**Validation**: Zod schemas shared between client and server ensure type safety and consistent validation rules across the stack. Schemas are defined in `shared/schema.ts` and exported for both frontend forms and backend API validation.

**Development Server**: Custom Vite integration in development mode with HMR (Hot Module Replacement), automatic error overlays, and middleware mode for seamless full-stack development.

**Production Build**: Separate builds for client (Vite) and server (esbuild), with static assets served from Express in production.

### Database Architecture

**ORM**: Drizzle ORM for type-safe database queries and schema management.

**Database**: PostgreSQL via Neon serverless driver with WebSocket support for connection pooling.

**Schema Design**:

- **teams**: Core organizational units with name and description
- **team_members**: Individual contributors with skills (JSON array), weekly hours, role, and active status
- **work_items**: Tasks/projects with type (demand/project/om), priority, status, and estimated hours
- **allocations**: Resource forecasts linking team members to work items with weekly hour allocations and date ranges
- **out_of_office**: Time-off tracking with date ranges and reasons

**Key Relationships**:
- Team members belong to teams (optional foreign key)
- Allocations link team members to work items
- Out-of-office entries belong to team members

**Computed Data**: The application calculates capacity percentages, allocated hours, and availability statistics at query time rather than storing derived values.

**Migration Strategy**: Drizzle Kit for schema migrations with configuration in `drizzle.config.ts`. Migrations stored in `/migrations` directory.

### Code Organization

**Monorepo Structure**: Client, server, and shared code in a single repository with path aliases configured in TypeScript and Vite:
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

**Shared Types**: TypeScript types and Zod schemas in `/shared` directory, ensuring type consistency between frontend and backend. This includes database schema types, insert/update types, and composite types with relationships.

**Component Organization**: UI components separated into reusable primitives (`/components/ui/`) and feature-specific components (`/components/`). Example components provided in `/components/examples/` for documentation.

**API Client**: Centralized API request handling in `lib/queryClient.ts` with error handling, JSON parsing, and credential management built-in.

### Authentication & Authorization

Currently, the application does not implement authentication. Session management infrastructure is present (connect-pg-simple) but not actively used. Future implementation would require adding user authentication, session handling, and role-based access control.

### Error Handling

**Client-side**: Toast notifications for user-facing errors, with error boundaries (via Vite plugin) for runtime errors during development.

**Server-side**: Express error middleware catches and formats errors, returning JSON responses with appropriate HTTP status codes. Detailed error logging to console in development.

### Performance Considerations

**Query Optimization**: React Query with infinite stale time reduces unnecessary network requests. Queries invalidated explicitly after mutations.

**Build Optimization**: Vite leverages ES modules and tree-shaking for optimal bundle sizes. Production builds use esbuild for fast server compilation.

**Development Experience**: HMR for instant feedback, TypeScript for type safety, and path aliases for cleaner imports.

## External Dependencies

### Core Libraries

- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe ORM for database operations
- **@neondatabase/serverless**: PostgreSQL driver with WebSocket support for Neon database
- **react-hook-form**: Form state management with performance optimization
- **zod**: Runtime type validation and schema definition

### UI Component Libraries

- **@radix-ui/***: Headless UI primitives (20+ components including dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui**: Pre-styled component library built on Radix UI
- **lucide-react**: Icon library
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling

### Development Tools

- **vite**: Build tool and dev server
- **typescript**: Static type checking
- **esbuild**: Fast JavaScript bundler for production server builds
- **drizzle-kit**: Database migration toolkit

### Third-party Integration SDKs

- **@linear/sdk**: Linear project management API integration
- **@octokit/rest**: GitHub API integration

Note: While Linear and GitHub SDKs are installed, they are not currently integrated into the application. These would be used for future features like syncing work items with Linear or GitHub issues.

### Session & Storage

- **connect-pg-simple**: PostgreSQL session store (installed but not actively used)
- **ws**: WebSocket library for database connections

### Routing & Navigation

- **wouter**: Lightweight client-side routing library (~1.2KB)

### Date Handling

- **date-fns**: Modern date utility library for formatting and manipulation