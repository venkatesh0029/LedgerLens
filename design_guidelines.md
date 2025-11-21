# Design Guidelines: AI-Powered Fraud Detection & Trust Scoring System

## Design Approach
**Design System**: Material Design + Fintech Dashboard Inspiration (Stripe Dashboard, Plaid, modern banking interfaces)

**Rationale**: Enterprise-grade data visualization requiring clarity, trust, and professional aesthetics. Information-dense interface prioritizing efficiency and real-time data comprehension.

## Core Design Elements

### Typography
- **Primary Font**: Inter (Google Fonts CDN)
- **Monospace Font**: JetBrains Mono (for transaction hashes, blockchain data)
- **Hierarchy**:
  - Page Headers: text-3xl font-bold
  - Section Headers: text-xl font-semibold
  - Data Labels: text-sm font-medium uppercase tracking-wide
  - Body Text: text-base
  - Small Data: text-xs for timestamps, IDs
  - Monospace Usage: Transaction hashes, wallet addresses, trust scores

### Layout System
**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4
- Dashboard margins: m-8 for main container

**Grid Structure**:
- Dashboard: 12-column grid system
- Stat cards: grid-cols-1 md:grid-cols-3 lg:grid-cols-4
- Main content: 2/3 width, Sidebar: 1/3 width split on large screens

### Component Library

**Navigation**
- Top navbar: Fixed position, full-width, height h-16
- Logo left, user profile/notifications right
- Navigation items: inline horizontal menu with active state indicators
- Mobile: Hamburger menu with slide-out drawer

**Dashboard Cards**
- Elevated cards with subtle borders (border border-gray-200)
- Rounded corners: rounded-lg
- Padding: p-6
- Shadow: shadow-sm with hover:shadow-md transition

**Trust Score Display**
- Large circular progress indicator (100-200px diameter)
- Numerical score prominently displayed in center
- Visual gradient based on score ranges:
  - High trust: Green spectrum indicators
  - Medium trust: Yellow/amber indicators
  - Low trust: Red spectrum indicators
- Score history sparkline chart beneath main display

**Transaction Table**
- Striped rows for readability (alternate row styling)
- Sticky header on scroll
- Columns: Timestamp, Transaction ID, Amount, Status Badge, Trust Score, Actions
- Sort indicators on column headers
- Compact row height with adequate spacing (h-12 to h-14)

**Status Badges**
- Pill-shaped badges with rounded-full
- Small text (text-xs font-semibold)
- Distinct visual treatment:
  - Verified: Solid green background
  - Flagged: Solid red background
  - Pending Review: Solid yellow/amber background
  - Normal: Subtle gray background

**Fraud Alert Component**
- Prominent alert banner at top of dashboard when active
- Icon (warning triangle) + message + action button
- Dismissible with close button
- Red accent border-l-4 for severity

**Charts & Visualizations**
- Line charts for trust score trends over time
- Bar charts for fraud detection statistics
- Donut charts for transaction category breakdowns
- Clean, minimalist axis styling
- Gridlines: subtle, low-opacity
- Data points: clear hover states with tooltips

**Forms & Inputs**
- Transaction recording form: Stacked vertical layout
- Input fields: border rounded-md with focus:ring-2 states
- Labels: positioned above inputs, font-medium
- Submit buttons: Primary action style (see Buttons)

**Buttons**
- Primary: Solid fill, medium size (px-6 py-2.5)
- Secondary: Outlined variant
- Danger: For flagging fraud (red treatment)
- Icon buttons: Circular, icon-only for compact actions
- Disabled state: Reduced opacity with cursor-not-allowed

**Blockchain Visualization**
- Chain of connected blocks displayed horizontally
- Each block shows: Block number, timestamp, transaction count
- Visual connection lines between blocks
- Latest block highlighted with subtle pulse animation
- Click to expand block details

### Icons
**Library**: Heroicons (CDN)
- Dashboard: ChartBarIcon, ShieldCheckIcon
- Transactions: ClockIcon, CheckCircleIcon, ExclamationTriangleIcon
- User: UserCircleIcon
- Actions: PencilIcon, TrashIcon, EyeIcon
- Navigation: BellIcon, CogIcon, MenuIcon

### Animations
**Minimal, purposeful use only**:
- Stat counter animation on page load (counting up effect)
- Pulse on new fraud alert
- Smooth transitions for hover states (transition-all duration-200)
- Chart data loading skeleton states

### Layout Patterns

**Dashboard Homepage**:
- Top stats row: 4 metric cards (Total Transactions, Flagged Cases, Average Trust Score, Active Alerts)
- Primary content area: 2-column layout
  - Left (66%): Recent Transactions table + Fraud Detection Chart
  - Right (33%): Trust Score display + Quick Actions panel
- Full-width blockchain visualization at bottom

**Transaction Detail Page**:
- Header: Transaction ID, timestamp, status badge
- Content: 2-column detail view (transaction info left, trust analysis right)
- Timeline of transaction verification steps
- Related transactions section below

## Images
No hero images required. This is a dashboard application focused on data visualization and functionality. All visual elements are UI components, charts, and data displays.

---

**Design Philosophy**: Build user confidence through clarity, consistency, and immediate visual feedback. Every element serves the purpose of fraud detection efficiency and trust communication.