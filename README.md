<div align="center">

# 🏥 SmartPharma — Pharmacy Management System

![Angular](https://img.shields.io/badge/Angular-21.1-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)
![Material](https://img.shields.io/badge/Material_UI-21.1-0081CB?style=for-the-badge&logo=mui&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.5-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![JWT](https://img.shields.io/badge/JWT_Auth-4.0-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-RTL_%7C_LTR-8b5cf6?style=for-the-badge)
![Standalone](https://img.shields.io/badge/Angular_Standalone-100%25-0FAAFF?style=for-the-badge)
![Lazy Loaded](https://img.shields.io/badge/Lazy_Loaded-100%25-22c55e?style=for-the-badge)

</div>

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Why This Project Stands Out for Your CV](#-why-this-project-stands-out-for-your-cv)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Role-Based Access Control](#-role-based-access-control)
- [Advanced Analytics Dashboard](#-advanced-analytics-dashboard)
- [Stock Management & Demand Prediction](#-stock-management--demand-prediction)
- [Integrated Payment System](#-integrated-payment-system)
- [Reports & Export](#-reports--export)
- [Internationalization & UI](#-internationalization--ui)
- [Security](#-security)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Available Scripts](#-available-scripts)
- [Environment Configuration](#-environment-configuration)
- [Folder Structure](#-folder-structure)
- [Design Token Palette](#-design-token-palette)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Project Overview

**SmartPharma** is a **production-grade, enterprise-level Pharmacy Management System** — a comprehensive full-stack application that demonstrates **advanced Angular development**, **enterprise architecture patterns**, and **complex business domain modeling**. This project showcases the ability to build **scalable, maintainable, and performant web applications** using the latest web technologies.

### 🎯 Purpose

Built to serve as a complete solution for **pharmacy owners and managers**, SmartPharma handles every aspect of pharmaceutical operations — from **point-of-sale (POS)** and **inventory management** to **AI-powered demand prediction**, **financial reporting**, and **multi-language support** — all within a single, unified platform.

> 💡 **Perfect for your CV/Resume** — this project demonstrates **production-level expertise** in Angular 21, TypeScript, reactive programming, enterprise architecture, and complex business logic implementation.

---

## 🏆 Why This Project Stands Out for Your CV

### Technical Excellence

| CV Highlight | What It Demonstrates |
|:------------|:---------------------|
| **Angular 21 Standalone Components** | Zero `NgModule`s — 100% modern, future-proof Angular architecture. No legacy patterns. |
| **18+ Business Services** | Comprehensive service layer — shows mastery of **Dependency Injection**, **Separation of Concerns**, and **business logic abstraction**. |
| **20+ TypeScript Models** | Rich domain modeling — **interfaces**, **enums**, **union types**, and **type safety** across the entire codebase. |
| **Advanced Lazy Loading** | Every feature module loads **independently on demand** — demonstrates **performance optimization** and **code splitting** expertise. |
| **Full RBAC System** | Multi-layered **Route Guards** + **HTTP Interceptors** for enterprise-grade authentication and authorization. |
| **Angular Signals + RxJS** | Modern **reactive state management** combining **Signals API** with **RxJS observables** for optimal reactivity. |
| **Complete i18n (Arabic + English)** | Full **RTL/LTR** support with instant switching — demonstrates **internationalization** expertise. |
| **AI-Powered Features** | **Demand prediction engine** with trend analysis, confidence scoring, and seasonality — shows **data science integration**. |
| **Multi-Gateway Payments** | 6 payment methods with **full refund lifecycle** — demonstrates **complex financial domain modeling**. |
| **Centralized Error Handling** | **Error Interceptor** + **Error Handler Service** pipeline — shows **error resilience** best practices. |
| **Responsive Design** | Works seamlessly on **mobile, tablet, and desktop** — demonstrates **responsive UI/UX** skills. |
| **Unit Testing with Vitest** | Modern test runner with **JSDOM** — shows commitment to **code quality** and **test-driven development**. |
| **Reusable Pagination** | Unified pagination patterns across all list views — demonstrates **code reuse** and **DRY principles**. |
| **Clean Code Architecture** | Strict **core / features / shared / layouts** separation — shows **enterprise-grade organization**. |

### 🧠 Skills Demonstrated

```
🔷 Angular 21 (Standalone Components)   🔷 TypeScript 5.9
🔷 RxJS 7.8 (Observables, Subjects)     🔷 Angular Signals
🔷 Angular Material 21.1                🔷 Angular CDK
🔷 SCSS (Variables, Mixins, Gradients)  🔷 CSS Grid & Flexbox
🔷 Chart.js + ng2-charts                🔷 Data Visualization
🔷 JWT Authentication & Authorization   🔷 HTTP Interceptors
🔷 Route Guards (Auth + Role)           🔷 Lazy Loading
🔷 i18n (ngx-translate)                 🔷 RTL/LTR Support
🔷 Vitest + JSDOM                       🔷 Unit Testing
🔷 REST API Integration                 🔷 Error Handling Patterns
🔷 Reactive State Management            🔷 Signals + Observables
```

---

## ✨ Key Features

### 📊 Professional Dashboard
- **Live KPIs** — today's revenue, orders, average order value
- **Interactive Charts** — revenue & sales trends with Chart.js
- **Top Products Ranking** — with performance percentages
- **Low-Stock & Expiry Alerts** — visual indicators with color coding
- **Recent Sales Feed** — real-time transaction display
- **Gradient Color Schemes** — distinct visual identity per stat card

### 📦 Product Management
- **Full Product Catalog** — scientific name, barcode, category, unit type
- **Category Classification** — hierarchical category management
- **Price Tracking** — sell/buy price with prescription requirements
- **Custom Attributes** — extensible fields per product
- **Server-Side Pagination** — configurable page sizes with search

### 🏭 Advanced Inventory & Stock
- **Batch System** — production/expiry date tracking with lot numbers
- **Automatic Alerts** — low-stock and expired-product notifications
- **Stock Movement History** — add, remove, correction with timestamps
- **Location Management** — shelf, warehouse organization
- **Adjustment Tracking** — damaged, expired, returned, count error with reasons
- **Real-Time Valuation** — live inventory value calculation

### 🧠 AI-Powered Demand Prediction
- **Intelligent Forecasting** — future stock requirement predictions
- **Multi-Algorithm Confidence** — 0–100% confidence levels
- **Trend Analysis** — Increasing ⬆️ / Stable ➡️ / Decreasing ⬇️
- **Seasonality Factors** — High / Medium / Low
- **Smart Recommendations** — suggested purchase quantities
- **One-Click Purchase Orders** — create POs directly from predictions
- **Export & Share** — PDF, Excel, or shareable prediction links
- **Accuracy Analytics** — prediction performance tracking

### 💰 Integrated Sales & POS
- **Fast POS Interface** — optimized for quick transactions
- **Barcode Scanning** — dedicated auto-focused scanner input plus a "Quick Add via Scan" flow for fast initial catalog setup
- **Prescription Capture** — required photo upload for prescription-only products, with a per-pharmacy toggle to make it optional
- **Multi-Payment Support** — Cash, Visa, InstaPay, Fawry, Wallet, Bank Transfer — filterable per pharmacy
- **Discount Management** — flexible discount application
- **Customer Tracking** — phone-based customer identification
- **Sales History** — advanced search with filters
- **Invoice Details** — sequential numbering with detailed breakdowns

### 💳 Payment Processing
- **Multi-Gateway** — 6 payment method support
- **Full Refund System** — multi-status lifecycle (Pending → Approved → Processing → Completed)
- **Payment Statistics** — method distribution & revenue breakdown
- **Reference Tracking** — complete audit trail
- **Detailed History** — per-transaction records

### 📈 Advanced Analytics
- **Sales Analytics** — daily, weekly, monthly, yearly periods
- **Payment Distribution** — proportional revenue by method
- **Daily Comparisons** — today vs. previous periods
- **Profit Margins** — performance ratios & trends
- **Top Products** — revenue analysis with ranking

### 📑 Reporting Engine
- **Sales Reports** — revenue, orders, top products, daily distribution
- **Financial Reports** — profit, expenses, margins, monthly breakdown
- **Stock Reports** — inventory value, low stock, expired, category breakdown
- **Expiry Reports** — Urgent / Warning / OK classifications
- **PDF & Excel Export** — professional formatting for all reports

### 📋 Purchase Orders & Suppliers
- **Supplier Management** — active, inactive, blocked statuses
- **Purchase Orders** — draft → pending → approved → received → cancelled lifecycle
- **Priority Levels** — low, normal, urgent
- **Partial Receiving** — pending quantity tracking
- **Order Item Management** — received vs. ordered quantities
- **WhatsApp Integration** — send purchase orders directly to suppliers via WhatsApp Desktop or Web

### 💸 Expense Management
- **Multi-Category** — purchases, salaries, rent, utilities, maintenance, marketing, insurance, licenses, transport, other
- **Daily Summaries** — category breakdowns
- **Receipt Support** — attachment upload per expense

### 👥 User Management
- **Role-Based Access** — Admin, Pharmacist, Viewer, Manager
- **Multi-User Accounts** — per pharmacy support
- **Last-Login Tracking** — security monitoring
- **Activation/Deactivation** — user status control

### 🔔 Notification System
- **Real-Time Alerts** — in-app notification panel
- **Low-Stock Alerts** — automatic threshold monitoring
- **Expiry Alerts** — proactive expiration warnings
- **Slide-Out Panel** — intuitive notification center

### ⚙️ Advanced Settings
- **Pharmacy Profile** — business information management, currency, and enabled payment methods (propagates app-wide instantly)
- **Security Settings** — password policies, session timeout & session management, real TOTP-based 2FA
- **Notification Preferences** — per-user channel toggles, quiet hours, and preferred language for bilingual (Arabic/English) notification content
- **Backup Management** — self-service per-pharmacy data export (whole-database backup/restore is a separate, platform-operator-only tool)
- **User Profile** — personal settings, photo upload, password change

### 🌍 Internationalization (i18n)
- **Full Arabic RTL** — complete right-to-left layout
- **Full English LTR** — instant language switching
- **Zero Reload Switching** — language changes instantly
- **Translated Everything** — dates, currencies, UI strings, statuses
- **Persistent Preference** — saved to localStorage

### 🖨️ Printing & Export
- **Direct Invoice Printing** — optimized print layout
- **PDF Export** — professional report generation
- **Excel Export** — data analysis ready
- **Shareable Links** — temporary access sharing

---

## 🛠 Tech Stack

### Core Framework
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **Angular** | 21.1 | Frontend framework (Standalone Components) |
| **TypeScript** | 5.9 | Type-safe development |
| **RxJS** | 7.8 | Reactive programming & state streams |
| **Zone.js** | 0.16 | Change detection |

### UI & Design
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **Angular Material** | 21.1 | Material Design component library |
| **Angular CDK** | 21.1 | Component development kit |
| **SCSS** | — | Advanced styling with CSS variables |

### Charts & Visualization
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **Chart.js** | 4.5 | Interactive charting library |
| **ng2-charts** | 8.0 | Angular wrapper for Chart.js |

### Auth & Security
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **JWT Decode** | 4.0 | Token parsing & validation |
| **Route Guards** | — | Path protection (auth + role) |
| **HTTP Interceptors** | — | Centralized auth & error handling |

### Utilities
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **SweetAlert2** | 11.26 | Beautiful alert dialogs |
| **ngx-translate** | 17.0 | Complete i18n translation system |

### Testing
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **Vitest** | 4.0 | Fast unit testing framework |
| **JSDOM** | 27.1 | Browser environment simulation |

---

## 🏗 Architecture

### Architecture Diagram

```
📁 src/app/
├── 📁 core/                         # Core Layer — Foundation
│   ├── 📁 guards/                   #   Route Guards
│   ├── 📁 interceptors/             #   HTTP Interceptors
│   ├── 📁 models/                   #   TypeScript Models (20+)
│   ├── 📁 services/                 #   Business Services (18+)
│   └── 📁 utils/                    #   Utility Functions
│
├── 📁 features/                     # Feature Modules — Lazy Loaded
│   ├── 📁 auth/                     #   Authentication
│   ├── 📁 dashboard/               #   Main Dashboard
│   ├── 📁 products/                #   Product Catalog (4 sub-modules)
│   ├── 📁 stock/                   #   Stock Management (9 sub-modules)
│   ├── 📁 sales/                   #   Sales & POS (4 sub-modules)
│   ├── 📁 purchases/               #   Purchasing (4 sub-modules)
│   ├── 📁 payment/                 #   Payment Processing (5 sub-modules)
│   ├── 📁 expenses/                #   Expense Tracking
│   ├── 📁 reports/                 #   Reporting (4 report types)
│   ├── 📁 users/                   #   User Administration
│   ├── 📁 settings/                #   System Settings (6 sub-modules)
│   ├── 📁 notification-bell/       #   Notification Panel
│   └── 📁 help/                    #   Help Section
│
├── 📁 layouts/                      # Page Layouts
│   ├── 📁 auth-layout/             #   Auth pages shell
│   └── 📁 main-layout/             #   Main app shell (Header + Sidebar + Footer)
│
├── 📁 shared/                       # Shared Module
│   ├── material.module.ts          #   Material module aggregation
│   ├── 📁 components/              #   Reusable components
│   ├── 📁 directives/              #   Custom directives
│   ├── 📁 models/                  #   Shared models
│   └── 📁 services/                #   Shared services
│
├── app.config.ts                   # Application bootstrap config
├── app.routes.ts                   # Route definitions
└── app.ts                          # Root component
```

Total: **~40 feature sub-modules** | **18+ services** | **20+ models** | **4 guards/interceptors** | **100% standalone**

### Architecture Principles

| Principle | Implementation |
|:----------|:---------------|
| **Standalone Components** | Zero NgModules — 100% modern Angular |
| **Lazy Loading** | Every feature module loads on-demand |
| **Dependency Injection** | Angular DI with `inject()` function |
| **Signals API** | Modern reactive state via Angular Signals |
| **Reactive Programming** | RxJS observables for async data streams |
| **Interceptor Pattern** | Centralized request/response processing |
| **Guard Pattern** | Multi-layer route protection |
| **Barrel Exports** | Clean imports via `index.ts` |
| **Environment Config** | Per-environment configuration files |
| **Error Pipeline** | Interceptor → Service → UI component chain |

---

## 🔐 Role-Based Access Control

### Role Hierarchy

```
                        ┌─────────────┐
                        │    ADMIN    │  ← Full system access
                        └──────┬──────┘
                               │
                        ┌──────┴──────┐
                        │   MANAGER   │  ← Operations, reports, staff
                        └──────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    │     PHARMACIST      │  ← Sales, basic stock
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │       VIEWER        │  ← Read-only access
                    └─────────────────────┘
```

### Security Layers

| Layer | Guard/Interceptor | Purpose |
|:------|:------------------|:--------|
| **Authentication** | `authGuard` | Ensures user is authenticated before accessing routes |
| **Authorization** | `roleGuard` | Restricts feature access based on user role |
| **Token Injection** | `authInterceptor` | Automatically attaches JWT Bearer tokens |
| **Error Handling** | `errorInterceptor` | Centralized error handling with auto-logout on 401 |

---

## 📊 Advanced Analytics Dashboard

### Real-Time KPIs
```
📈 Today's Revenue       💰 Inventory Value        📦 Total Products
🛒 Today's Orders        ⚠️ Low Stock Items        ❌ Out of Stock
📊 Avg Order Value       🕐 Expiring Soon          💵 Profit Margins
```

### Charts & Visualizations
- **Sales Trend Chart** — revenue tracking over time with interactive tooltips
- **Payment Method Distribution** — proportional breakdown with legend
- **Top Products Table** — ranked by quantity sold & revenue generated
- **Daily Comparisons** — today vs. yesterday vs. last week

---

## 📦 Stock Management & Demand Prediction

### Batch System
```
Batch #2025-001
├── Product: Paracetamol 500mg
├── Quantity: 1000 → 750 (remaining)
├── Production Date: 2025-01-15
├── Expiry Date: 2027-01-15
├── Location: Shelf A-3 | Main Warehouse
├── Status: Active ✅
├── Buy Price: 5.00 EGP
└── Sell Price: 8.50 EGP
```

### AI Demand Prediction
- **Confidence Level** — 0% to 100% per prediction
- **Trend Analysis** — Increasing ⬆️ / Stable ➡️ / Decreasing ⬇️
- **Seasonality Factor** — High / Medium / Low
- **Recommended Order Quantity** — calculated from historical data
- **Smart Recommendations** — data-driven purchase suggestions
- **One-Click PO Generation** — create purchase orders from predictions
- **Export & Share** — PDF, Excel, or shareable link

---

## 💳 Integrated Payment System

### Supported Payment Methods
| Method | Type | Status |
|:-------|:-----|:-------|
| 💵 **Cash** | Direct | ✅ Supported |
| 💳 **Visa** | Payment Gateway | ✅ Supported |
| 📱 **InstaPay** | Digital Wallet | ✅ Supported |
| 🏢 **Fawry** | E-Payment | ✅ Supported |
| 📲 **Wallet** | Mobile Wallet | ✅ Supported |
| 🏦 **Bank Transfer** | Wire Transfer | ✅ Supported |

### Payment Lifecycle
```
PENDING → PROCESSING → COMPLETED ✅
                    → FAILED ❌
                    → CANCELLED 🚫
COMPLETED → REFUNDED ↩️
```

### Refund System
- **Refund Request** — with specific reason
- **Status Flow** — Pending → Approved → Processing → Completed
- **Full Audit Trail** — complete history tracking

---

## 📑 Reports & Export

### Report Types

| Report | Contents |
|:-------|:---------|
| 📊 **Sales Report** | Total revenue, orders, top products, daily distribution |
| 💰 **Financial Report** | Profit, expenses, margins, monthly breakdown |
| 📦 **Stock Report** | Inventory value, low stock, expired, category breakdown |
| ⏰ **Expiry Report** | Expiring products by urgency (Urgent / Warning / OK) |

### Export Options
- 📄 **PDF** — professional print-ready reports (local HTML generation)
- 📊 **Excel** — analyzable data exports
- 🔗 **Share** — temporary shareable links

---

## 🌍 Internationalization & UI

### Language Features
- 🌐 **Arabic** — default language with full RTL layout
- 🇬🇧 **English** — instant LTR switch without page reload
- 📝 **Complete Translation** — all text, dates, currencies, statuses translated
- 🔄 **Instant Switching** — no page reload required (reactive)
- 💾 **Persistent Preference** — language saved to localStorage

### User Experience
- 📱 **Responsive Design** — mobile, tablet, and desktop optimized
- 🎨 **Material Design UI** — Angular Material components with custom theming
- 🔊 **Audio Alerts** — sound notifications for low stock/expiry
- 🔔 **Real-Time Notifications** — in-app toast & slide-out panel
- ⚡ **Fast Loading** — full lazy loading for all feature modules
- 🌈 **Gradient Color Scheme** — professional visual design

---

## 🔒 Security

| Layer | Mechanism |
|:------|:----------|
| **Authentication** | JWT (Access + Refresh Tokens) |
| **Authorization** | Role-Based Access Control (RBAC) with 4 roles |
| **Transport** | HTTPS + Bearer Authorization Headers |
| **Interception** | HTTP Interceptors for automatic token injection |
| **Routing** | Route Guards (`authGuard` + `roleGuard`) |
| **Error Handling** | Centralized Error Interceptor pipeline |
| **Storage** | Secure localStorage with token management |
| **Auto-Logout** | On token expiry or 401 response |

---

## 📋 Prerequisites

| Requirement | Version |
|:------------|:--------|
| **Node.js** | 18.x or later |
| **npm** | 10.x or later |
| **Angular CLI** | 21.1.x |
| **Browsers** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/amer-rouby/smartpharma-frontend.git
cd smartpharma-frontend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Start Development Server
```bash
npm start
# or
ng serve
```
Navigate to `http://localhost:4200/`

### 4️⃣ Production Build
```bash
npm run build
```
Output artifacts are placed in the `dist/` directory.

### 5️⃣ Run Tests
```bash
npm test
```

---

## 📜 Available Scripts

| Command | Description |
|:--------|:------------|
| `npm start` | Start the development server |
| `npm run build` | Build for production |
| `npm test` | Run Vitest unit tests |
| `npm run watch` | Build with watch mode (development) |

---

## ⚙️ Environment Configuration

### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api',
  appVersion: '1.0.0',
  appName: 'صيدليتي الذكية'
};
```

### Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.smartpharma.eg/api',
  appVersion: '1.0.0',
  appName: 'صيدليتي الذكية'
};
```

The backend must be running (default `http://localhost:8081`) for the dev server to have anything to talk to — see the [backend repository](https://github.com/amer-rouby/smartpharma-backend).

---

## 🎨 Design Token Palette

```
🟢 Primary:    #10b981 (Emerald Green)
🟣 Secondary:  #8b5cf6 (Violet)
🟡 Warning:    #f59e0b (Amber)
🔵 Info:       #3b82f6 (Blue)

Sidebar:       Gradient #667eea → #764ba2
Background:    #f5f7fa (Light Gray)
Text:          #111827 → #6b7280 (Dark → Gray)
Success:       Green Gradient #10b981 → #059669
Error:         Red Gradient #ef4444 → #dc2626
```

---

## 📁 Folder Structure

```
smartpharma-frontend/
├── public/                          # Static assets
│   └── favicon.ico
├── uploads/                         # User uploads
│   └── profiles/                    # Profile images
├── src/
│   ├── index.html                   # Entry HTML (RTL by default)
│   ├── main.ts                      # Bootstrap entry point
│   ├── styles.scss                  # Global styles (800+ lines)
│   ├── polyfills.ts                 # Zone.js polyfills
│   ├── app/
│   │   ├── app.ts                   # Root component
│   │   ├── app.config.ts            # App configuration & providers
│   │   ├── app.routes.ts            # Top-level route definitions
│   │   ├── core/                    # Core layer
│   │   ├── features/                # Feature modules (13+ lazy-loaded)
│   │   ├── layouts/                 # Layout components
│   │   └── shared/                  # Shared components
│   ├── assets/
│   │   ├── i18n/                    # Translation files
│   │   └── images/                  # Static images
│   └── environments/                # Environment configs
├── angular.json                     # Angular CLI configuration
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.app.json                # App-specific TS config
├── tsconfig.spec.json               # Test-specific TS config
├── .editorconfig                    # Editor settings
└── .gitignore                       # Git ignore rules
```

---

## 🔗 Related Repositories

- **Backend API**: [smartpharma-backend](https://github.com/amer-rouby/smartpharma-backend) — Spring Boot
- **Mobile app**: [smartpharma-mobile](https://github.com/amer-rouby/smartpharma-mobile) — Ionic + Angular

---

## 👨‍💻 Contributing

Contributions are welcome! To add new features or fix issues:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

- 🐛 **Bug Reports**: GitHub Issues
- 💡 **Feature Requests**: GitHub Discussions
- 📧 **Email**: support@smartpharma.eg

---

## 📄 License

This project is proprietary and protected by intellectual property rights.

---

<div align="center">

### 🏥 SmartPharma — The Complete Pharmacy Management Solution

**Built with ❤️ using Angular 21 & TypeScript**

---

*Version 1.0.0*

</div>
