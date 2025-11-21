# AI-Powered Fraud Detection & Trust Scoring System

## Overview

This is an enterprise-grade blockchain-based fraud detection and trust scoring platform. The system provides real-time transaction monitoring, ML-driven fraud prediction, and decentralized trust management through an information-dense fintech dashboard interface.

The application combines AI-powered fraud analysis with blockchain technology to create a comprehensive security platform that tracks transactions, assigns trust scores to users/nodes, and maintains an immutable blockchain ledger.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and dev server, providing fast hot module replacement
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design + fintech dashboard aesthetics (inspired by Stripe/Plaid)
- Custom color system with HSL variables supporting light/dark themes
- Typography: Inter font for UI, JetBrains Mono for monospaced data (hashes, addresses)

**State Management Strategy**
- Server state: TanStack Query with automatic caching and refetching
- UI state: React context (ThemeProvider for dark/light mode)
- Form state: React Hook Form with Zod validation
- No global state management library needed due to server-driven architecture

**Data Visualization**
- Recharts library for fraud detection statistics and trust score trends
- Custom circular progress indicators for trust scores
- Real-time blockchain visualization with animated latest block highlighting
- Color-coded status badges (green/verified, red/flagged, yellow/pending)

### Backend Architecture

**Server Framework**
- Express.js REST API running on Node.js
- TypeScript for type safety across client and server
- Development mode: Vite middleware integration for seamless full-stack dev experience
- Production mode: Serves pre-built static assets from dist/public

**API Design Pattern**
- RESTful endpoints following resource-based URL structure
- JSON request/response format with consistent error handling
- Endpoints:
  - `/api/stats` - Dashboard statistics aggregation
  - `/api/transactions` - CRUD operations with optional status filtering
  - `/api/userNodes` - User/node trust score management
  - `/api/blocks` - Blockchain ledger access

**Business Logic Layer**
- Storage abstraction interface (IStorage) for database operations
- In-memory storage implementation (MemStorage) as default
- Fraud detection scoring algorithm integrated into transaction processing
- Trust score calculation based on transaction history and flagged count
- Blockchain block creation with hash generation and Merkle root computation

### Data Storage

**Database Schema (Drizzle ORM)**
- PostgreSQL as the target database (via Neon serverless)
- Drizzle ORM for type-safe database queries and migrations
- Schema-first approach with TypeScript types derived from database schema

**Core Tables:**
1. `transactions` - All financial transactions with fraud scoring
   - Tracks amount, recipient, fraud status, fraud score, transaction hash
   - Status field: verified, flagged, or pending

2. `userNodes` - User/wallet addresses with trust metrics
   - Trust score (0-100 scale)
   - Transaction count and flagged count for reputation tracking
   - Last updated timestamp for score recalculation

3. `blockchainBlocks` - Immutable blockchain ledger
   - Block number, timestamp, previous/current hash
   - Merkle root for transaction verification
   - Transaction count per block

4. `trustScoreHistory` - Historical trust score data points
   - Enables trend visualization and score tracking over time

**Data Validation**
- Zod schemas generated from Drizzle schema using drizzle-zod
- Shared validation between client and server via `@shared` path alias
- Insert schemas exclude auto-generated fields (IDs, timestamps)

### Authentication & Authorization

Currently implements a session-based foundation:
- Express session middleware with connect-pg-simple for PostgreSQL session storage
- Session configuration ready but authentication flows not yet implemented
- Designed for future addition of user authentication

### External Dependencies

**Third-party Libraries:**
- **UI Components**: Radix UI primitives (@radix-ui/* packages) for accessible components
- **Forms**: React Hook Form + Hookform Resolvers for form state and validation
- **Data Fetching**: TanStack Query for async state management
- **Styling**: Tailwind CSS + class-variance-authority for variant-based styling
- **Charts**: Recharts for data visualization
- **Date Handling**: date-fns for date formatting and manipulation
- **Database**: Drizzle ORM + @neondatabase/serverless for database access

**Design System:**
- Google Fonts CDN: Inter (primary), JetBrains Mono (monospace)
- Color scheme based on neutral base with blue primary accent
- Shadow system with multiple elevation levels
- 12-column responsive grid layout

**Development Tools:**
- Replit-specific plugins: cartographer, dev-banner, runtime-error-modal
- ESBuild for production server bundling
- TypeScript compiler for type checking
- PostCSS with Tailwind and Autoprefixer

### Design Patterns & Architectural Decisions

**Monorepo Structure**
- `/client` - React frontend with index.html entry point
- `/server` - Express backend with dev/prod entry points
- `/shared` - Type definitions and schemas shared between client/server
- Path aliases (`@/*`, `@shared/*`) for clean imports

**Development vs Production**
- Dev: Vite middleware serves client with HMR, backend runs with tsx
- Prod: Pre-built static assets served by Express, single Node process
- Environment-aware configuration in vite.config.ts and server entry points

**Type Safety Strategy**
- Single source of truth: Database schema defines types
- Automatic type derivation: Zod schemas from Drizzle, React Hook Form types from Zod
- No type duplication across stack boundaries

**Real-time Considerations**
- Currently polling-based with React Query refetch intervals
- Architecture supports WebSocket upgrade for real-time blockchain updates
- Fraud alerts use in-memory state with localStorage persistence potential