# Admin Dashboard Integration Documentation

## Overview

The Admin dashboard has been refactored for better integration and modularity. All components now work together seamlessly with shared styling and consistent behavior.

## File Structure and Integration

### Core Components

1. **AdminDashboard.jsx** - Main dashboard container

   - Central routing and navigation
   - Shared sidebar and top bar
   - Integrates all page components
   - Responsive design with collapsible sidebar

2. **AdminSales.jsx** - Sales page component

   - Modular component imported into AdminDashboard
   - Handles printing/layout tabs and sales figures
   - Receives shared components as props (OrdersTable, data)

3. **AdminOrderHistory.jsx** - Order history with dual exports
   - `AdminOrderHistoryContent` - Modular component for integration
   - `AdminOrderHistory` - Standalone page (for backward compatibility)
   - Filtering tabs (All, Completed, Cancelled)

### Styling Architecture

1. **AdminDashboard.css** - Main stylesheet (31KB)

   - Complete CSS variable system for theming
   - Shared component styles (.ad-\* classes)
   - Responsive design with mobile-first approach
   - All sales and messages preview styles

2. **AdminSales.css** - Minimal (empty by design)

   - All styles moved to AdminDashboard.css for consistency
   - Available for Sales-specific overrides if needed

3. **AdminOrderHistory.css** - Order history specific styles
   - Tab functionality (.aoh-tab-btn)
   - Empty state messaging
   - Complementary to main dashboard styles

## Key Integration Features

### Shared Components

- `OrdersTable` component with consistent status rendering
- Unified color scheme and typography
- Responsive table design

### Modular Architecture

- Page content components can be used independently
- Props-based data passing for flexibility
- Consistent API between components

### CSS Variable System

- `--color-*` variables for consistent theming
- `--space-*` variables for consistent spacing
- `--font-*` variables for typography
- Responsive breakpoints in CSS variables

### Responsive Design

- Mobile-first approach with progressive enhancement
- Collapsible sidebar for desktop
- Mobile overlay for sidebar on small screens
- Responsive tables and layouts

## Usage Examples

### Using as Integrated Dashboard

```jsx
import AdminDashboard from "./AdminPage/AdminDashboard";
// Renders complete dashboard with routing
<AdminDashboard />;
```

### Using Individual Components

```jsx
import { AdminOrderHistoryContent } from "./AdminPage/AdminOrderHistory";
import AdminSalesComponent from "./AdminPage/AdminSales";

// Use as page content within custom layout
<AdminOrderHistoryContent
  OrdersTableComponent={OrdersTable}
  ordersData={orders}
/>;
```

## Status Rendering

Consistent status badges across all components:

- `delivered` - Purple background with dot icon
- `ready` - Blue background
- `ontheway` - Blue border, transparent background
- `cancelled` - Red background

## Mobile Responsiveness

- Sidebar transforms to overlay on mobile (<768px)
- Tables become horizontally scrollable
- Condensed spacing and font sizes
- Hidden elements on smaller screens (user names, etc.)

## Future Enhancements

- Message component integration
- Real-time data updates
- Advanced filtering options
- Export functionality
- Dark mode theme support
