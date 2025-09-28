# Smart Pharmacy Flow

## Overview
Smart Pharmacy Flow is a web application designed to streamline the pharmacy ordering process through a peer-to-peer (P2P) system. It allows pharmacy users to select nearby regions, place orders, and view a live timeline of their orders. The application also enables real-time acceptance or rejection of orders by pharmacies, ensuring an efficient and user-friendly experience.

## Features
- **Region Selection**: Users can select their nearby regions to find available pharmacies.
- **Order Placement**: Pharmacy users can place orders for drugs directly through the application.
- **Live Order Timeline**: A dashboard that displays a live timeline of order statuses, providing real-time updates.
- **Order Notifications**: A notification system that alerts users about order updates, including acceptance or rejection by pharmacies.
- **Intuitive UI**: A professional and user-friendly interface designed for ease of use.

## Project Structure
```
smart-pharmacy-flow
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components
│   │   ├── Dashboard
│   │   │   └── MetricCards.tsx
│   │   ├── Database
│   │   │   └── DrugsTable.tsx
│   │   ├── Forecasting
│   │   │   └── ForecastingDashboard.tsx
│   │   ├── Insurance
│   │   │   ├── ClaimsDashboard.tsx
│   │   │   ├── ClaimSubmission.tsx
│   │   │   ├── CoverageChecker.tsx
│   │   │   ├── InsuranceModule.tsx
│   │   │   └── PatientVerification.tsx
│   │   ├── Inventory
│   │   │   └── InventoryGrid.tsx
│   │   ├── Layout
│   │   │   └── Header.tsx
│   │   ├── Navigation
│   │   │   └── Sidebar.tsx
│   │   ├── Orders
│   │   │   └── SmartOrdering.tsx
│   │   ├── P2P
│   │   │   ├── DrugSearch.tsx
│   │   │   ├── OrderDashboard.tsx
│   │   │   ├── OrderWorkflow.tsx
│   │   │   ├── P2POrderingModule.tsx
│   │   │   ├── PharmacyLocator.tsx
│   │   │   ├── RegionSelector.tsx
│   │   │   ├── LiveTimeline.tsx
│   │   │   ├── OrderNotification.tsx
│   │   │   └── OrderActions.tsx
│   │   └── ui
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       ├── tooltip.tsx
│   │       └── use-toast.ts
│   ├── hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── integrations
│   │   └── supabase
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib
│   │   └── utils.ts
│   └── pages
│       ├── Index.tsx
│       └── NotFound.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd smart-pharmacy-flow
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.