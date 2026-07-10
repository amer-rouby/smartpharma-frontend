<div align="center">

# 🏥 SmartPharma — Pharmacy Management System

![Angular](https://img.shields.io/badge/Angular-21.1-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)
![Material](https://img.shields.io/badge/Material-UI-0081CB?style=for-the-badge&logo=mui&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.5-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-RTL_|_LTR-8b5cf6?style=for-the-badge)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
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
- [Folder Structure](#-folder-structure)
- [Important Technical Notes](#-important-technical-notes)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

**SmartPharma** is a comprehensive, production-grade **Pharmacy Management System** built with cutting-edge web technologies. It delivers an end-to-end solution for pharmacy owners and managers to handle every aspect of pharmaceutical operations from a single, unified platform — complete with full **Arabic RTL** and **English LTR** support.

The system is architected for **high performance, security, and scalability**, leveraging **Angular v21** with the modern **Standalone Components** pattern that eliminates the need for traditional `NgModule`s — making it future-proof and aligned with 2025+ web development standards.

> 💡 **Ideal for your resume/CV** — this project demonstrates advanced expertise in Angular, TypeScript, reactive state management, enterprise architecture patterns, and complex business-domain modeling.

---

## ✨ Key Features

### 📊 Professional Dashboard
- Live KPIs (today's revenue, orders, average order value)
- Interactive revenue & sales charts
- Top-performing products ranking with performance percentages
- Low-stock and expiry alerts with visual indicators
- Real-time recent sales feed
- Distinct gradient color schemes per stat card

### 📦 Product Management
- Full product catalog (scientific name, barcode, category, unit type)
- Category classification & management
- Sell/buy price tracking with prescription requirements
- Custom extensible attributes per product
- Server-side pagination with configurable page sizes

### 🏭 Advanced Inventory & Stock
- **Batch system** with production/expiry date tracking
- Automatic low-stock and expired-product alerts
- Stock movement history (add, remove, correction)
- Location management (shelf, warehouse)
- Stock adjustments with reason tracking (damaged, expired, returned, count error)
- Real-time stock valuation

### 🧠 AI-Powered Demand Prediction
- Intelligent forecasts for future stock requirements
- Multi-algorithm confidence levels
- Trend analysis (increasing, decreasing, stable)
- Seasonality factors (high, medium, low)
- Smart purchase recommendations with suggested quantities
- One-click purchase order creation from predictions
- PDF/Excel export and shareable prediction links
- Prediction accuracy analytics

### 💰 Integrated Sales & POS
- Fast, efficient point-of-sale (POS) interface
- Multi-payment support: Cash, Visa, InstaPay, Fawry, Wallet, Bank Transfer
- Discount management & customer phone tracking
- Full sales history with advanced search
- Invoice details with sequential numbering

### 💳 Payment Processing
- Multi-gateway payment processing
- Full refund system with multi-status lifecycle
- Payment statistics & reference tracking
- Detailed payment history

### 📈 Advanced Analytics
- Sales analytics by period (daily, weekly, monthly, yearly)
- Payment method distribution & revenue breakdown
- Daily comparisons & trend tracking
- Profit margins & performance ratios
- Top-products revenue analysis

### 📑 Reporting Engine
- **Sales reports** — revenue, orders, top products, daily distribution
- **Financial reports** — profit, expenses, margins, monthly breakdown
- **Stock reports** — inventory value, low stock, expired items, category breakdown
- **Expiry reports** — urgent, warning, OK classifications
- PDF & Excel export for all report types

### 📋 Purchase Orders & Suppliers
- Supplier management (active, inactive, blocked)
- Purchase orders with full status lifecycle (draft, pending, approved, received, cancelled)
- Priority levels (low, normal, urgent)
- Partial receiving & pending quantity tracking
- Order item management with received vs. ordered quantities

### 💸 Expense Management
- Multi-category expense recording (purchases, salaries, rent, utilities, maintenance, marketing, insurance, licenses, transport, other)
- Daily summaries & category breakdowns
- Receipt/attachment support

### 👥 User Management
- Role-based access (Admin, Pharmacist, Viewer, Manager)
- Multi-user accounts per pharmacy
- Last-login tracking
- User activation/deactivation

### 🔔 Notification System
- Real-time in-app notifications
- Low-stock & expiry alerts
- Slide-out notification panel

### ⚙️ Advanced Settings
- Pharmacy profile management
- Security & password settings
- Notification preferences
- Backup management
- User profile management

### 🌍 Internationalization (i18n)
- Full Arabic support with complete RTL layout
- Full English support with LTR layout
- Instant language switching without page reload
- Translated dates, currencies, and all UI strings
- Persistent language preference via localStorage

### 🖨️ Printing & Export
- Direct invoice printing
- PDF export for reports & predictions
- Excel export for data analysis
- Shareable prediction links

---

## 🛠 Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 21.1 | Frontend framework (Standalone Components) |
| **TypeScript** | 5.9 | Type-safe development |
| **RxJS** | 7.8 | Reactive programming & state streams |
| **Zone.js** | 0.16 | Change detection |

### UI & Design
| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular Material** | 21.1 | Material Design component library |
| **Angular CDK** | 21.1 | Component dev kit |
| **SCSS** | — | Advanced styling with CSS Variables |

### Charts & Visualization
| Technology | Version | Purpose |
|------------|---------|---------|
| **Chart.js** | 4.5 | Interactive charting |
| **ng2-charts** | 8.0 | Angular wrapper for Chart.js |

### Auth & Security
| Technology | Version | Purpose |
|------------|---------|---------|
| **JWT Decode** | 4.0 | Token parsing |
| **Route Guards** | — | Path protection |
| **HTTP Interceptors** | — | Centralized auth & error handling |

### Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| **Axios** | 1.13 | HTTP client (supplementary) |
| **SweetAlert2** | 11.26 | Beautiful alert dialogs |
| **ngx-translate** | 17.0 | Complete i18n translation system |

### Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | 4.0 | Fast unit testing |
| **JSDOM** | 27.1 | Browser environment simulation |

---

## 🏗 Architecture

The project follows a **scalable enterprise architecture** with strict **Separation of Concerns**:

```
📁 src/app/
├── 📁 core/                         # Core Layer
│   ├── 📁 guards/                   # Route Guards
│   │   ├── auth.guard.ts            # Auth guard
│   │   └── role.guard.ts            # Role-based guard
│   ├── 📁 interceptors/             # HTTP Interceptors
│   │   ├── auth.interceptor.ts      # Auto JWT injection
│   │   └── error.interceptor.ts     # Centralized error handling
│   ├── 📁 models/                   # TypeScript Models (20+)
│   │   ├── 📁 settings/             # Settings models
│   │   ├── product.model.ts         # Product interfaces
│   │   ├── sale.model.ts            # Sales interfaces
│   │   ├── stock.model.ts           # Stock & batch interfaces
│   │   ├── payment.model.ts         # Payment & refund interfaces
│   │   ├── purchase-order.model.ts  # PO & supplier interfaces
│   │   ├── user.model.ts            # User & auth interfaces
│   │   ├── Expense.model.ts         # Expense interfaces
│   │   ├── Report.model.ts          # Report interfaces
│   │   ├── dashboard.model.ts       # Dashboard/KPI interfaces
│   │   ├── Notification.model.ts    # Notification interfaces
│   │   ├── stock-alert.model.ts     # Stock alert interfaces
│   │   ├── Export.model.ts          # Export interfaces
│   │   └── index.ts                 # Barrel export
│   ├── 📁 services/                 # Business Services (18+)
│   │   ├── 📁 settings/             # Settings services
│   │   ├── auth.service.ts          # Authentication
│   │   ├── dashboard.service.ts     # Dashboard stats
│   │   ├── product.service.ts       # Product CRUD
│   │   ├── stock.service.ts         # Stock & batch management
│   │   ├── sales.service.ts         # Sales & POS
│   │   ├── payment.service.ts       # Payment processing
│   │   ├── expense.service.ts       # Expense tracking
│   │   ├── purchase-order.service.ts # PO management
│   │   ├── supplier.service.ts      # Supplier management
│   │   ├── report.service.ts        # Reporting engine
│   │   ├── notification.service.ts  # Notifications
│   │   ├── demand-prediction.service.ts # AI demand forecasting
│   │   ├── language.service.ts      # i18n management
│   │   ├── pharmacy-context.service.ts # Multi-pharmacy context
│   │   ├── error-handler.service.ts # Centralized error handler
│   │   ├── invoice-print.service.ts # Invoice printing
│   │   ├── export.service.ts        # PDF/Excel export
│   │   ├── share.service.ts         # Link sharing
│   │   └── audio.service.ts         # Sound alerts
│   └── 📁 utils/                    # Utility Functions
│       ├── format.util.ts           # Currency, date formatting
│       ├── http-error.util.ts       # HTTP error fallback
│       ├── pagination.util.ts       # Pagination helpers
│       └── paginator-state.ts       # Paginator state management
│
├── 📁 features/                     # Feature Modules (Lazy Loaded)
│   ├── 📁 auth/                     # Login & Registration
│   ├── 📁 dashboard/               # Main Dashboard
│   ├── 📁 products/                # Product Catalog
│   │   ├── product-list/
│   │   ├── product-form/
│   │   ├── product-categories/
│   │   └── category-dialog/
│   ├── 📁 stock/                   # Stock Management
│   │   ├── stock-management/
│   │   ├── stock-alerts/
│   │   ├── stock-movements/
│   │   ├── stock-adjustment-dialog/
│   │   ├── stock-adjustment-history/
│   │   ├── stock-batch-form/
│   │   ├── demand-predictions/
│   │   ├── prediction-detail/
│   │   └── edit-prediction-dialog/
│   ├── 📁 sales/                   # Sales & POS
│   │   ├── sales-form/             # POS interface
│   │   ├── sales-history/          # Sales records
│   │   ├── sales-analytics/        # Advanced analytics
│   │   └── sale-details-dialog/    # Invoice detail modal
│   ├── 📁 purchases/               # Purchasing
│   │   ├── purchase-orders/
│   │   ├── purchase-form/
│   │   ├── purchase-detail/
│   │   └── suppliers/
│   ├── 📁 payment/                 # Payment Processing
│   │   ├── payment-form/
│   │   ├── payment-history/
│   │   ├── payment-stats/
│   │   ├── payment-receipt/
│   │   └── refund-form/
│   ├── 📁 expenses/                # Expense Tracking
│   ├── 📁 reports/                 # Reports
│   │   ├── sales-report/
│   │   ├── financial-report/
│   │   ├── stock-report/
│   │   └── expiry-report/
│   ├── 📁 users/                   # User Administration
│   ├── 📁 settings/                # System Settings
│   │   ├── pharmacy/
│   │   ├── profile/
│   │   ├── security/
│   │   ├── notifications/
│   │   ├── backup/
│   │   └── settings/
│   ├── 📁 notification-bell/       # Notification dropdown
│   └── 📁 help/                    # Help section
│
├── 📁 layouts/                     # Page Layouts
│   ├── 📁 auth-layout/             # Auth pages shell
│   └── 📁 main-layout/             # Main app shell (Header + Sidebar + Footer)
│
├── 📁 shared/                      # Shared Module
│   ├── material.module.ts          # Material module aggregation
│   ├── 📁 components/              # Reusable components
│   ├── 📁 directives/              # Custom directives
│   ├── 📁 models/                  # Shared models
│   └── 📁 services/                # Shared services
│
├── app.config.ts                   # Application bootstrap config
├── app.routes.ts                   # Route definitions
└── app.ts                          # Root component
```

### Architecture Principles

| Principle | Implementation |
|-----------|---------------|
| **Standalone Components** | Zero NgModules — 100% modern Angular |
| **Lazy Loading** | Every feature module loads on-demand |
| **Dependency Injection** | Angular DI with `inject()` function |
| **Signals API** | Modern reactive state via Angular Signals |
| **Reactive Programming** | RxJS observables for async data streams |
| **Interceptor Pattern** | Centralized request/response processing |
| **Guard Pattern** | Multi-layer route protection |
| **Barrel Exports** | Clean imports via index.ts |
| **Environment Config** | Per-environment configuration files |

---

## 🔐 Role-Based Access Control

The system implements a four-tier role hierarchy:

| Role | Privileges |
|------|-----------|
| **ADMIN** | Full system access — manage users, pharmacy settings, all data |
| **MANAGER** | Daily operations, reports, analytics, staff oversight |
| **PHARMACIST** | Sales processing, basic stock management |
| **VIEWER** | Read-only access to data and reports |

**Security Layers:**
- **`authGuard`** — ensures the user is authenticated before accessing any protected route
- **`roleGuard`** — restricts feature access based on user role
- **`authInterceptor`** — automatically attaches JWT Bearer tokens to all outgoing HTTP requests
- **`errorInterceptor`** — centralized error handling with automatic logout on 401

---

## 📊 Advanced Analytics Dashboard

### Real-Time KPIs
```
📈 Today's Revenue       💰 Inventory Value        📦 Total Products
🛒 Today's Orders        ⚠️ Low Stock Items        ❌ Out of Stock
📊 Average Order Value   🕐 Expiring Soon          💵 Profit Margins
```

### Charts & Visualizations
- **Sales Trend Chart** — revenue tracking over time
- **Payment Method Distribution** — proportional breakdown
- **Top Products Table** — ranked by quantity sold & revenue
- **Daily Comparisons** — today vs. previous periods

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
- **Recommended Order Quantity** — calculated based on historical data
- **Smart Recommendations** — data-driven purchase suggestions
- **One-Click PO Generation** — create purchase orders directly from predictions
- **Export & Share** — PDF, Excel, or shareable link

---

## 💳 Integrated Payment System

### Supported Payment Methods
| Method | Type | Status |
|--------|------|--------|
| 💵 Cash | Direct | Supported |
| 💳 Visa | Payment Gateway | Supported |
| 📱 InstaPay | Digital Wallet | Supported |
| 🏢 Fawry | E-Payment | Supported |
| 📲 Wallet | Mobile Wallet | Supported |
| 🏦 Bank Transfer | Wire Transfer | Supported |

### Payment Lifecycle
```
PENDING → PROCESSING → COMPLETED ✅
                    → FAILED ❌
                    → CANCELLED 🚫
COMPLETED → REFUNDED ↩️
```

### Refund System
- Refund request with specific reason
- Status flow: Pending → Approved → Processing → Completed
- Full audit trail

---

## 📑 Reports & Export

### Report Types

| Report | Contents |
|--------|----------|
| 📊 **Sales Report** | Total revenue, orders, top products, daily distribution |
| 💰 **Financial Report** | Profit, expenses, margins, monthly breakdown |
| 📦 **Stock Report** | Inventory value, low stock, expired, category breakdown |
| ⏰ **Expiry Report** | Expiring products by urgency (Urgent / Warning / OK) |

### Export Options
- 📄 **PDF** — professional print-ready reports
- 📊 **Excel** — analyzable data exports
- 🔗 **Share** — temporary shareable links

---

## 🌍 Internationalization & UI

### Language Features
- 🌐 **Arabic** — default language with full RTL layout
- 🇬🇧 **English** — instant LTR switch
- 📝 **Complete Translation** — all text, dates, currencies translated
- 🔄 **Instant Switching** — no page reload required
- 💾 **Persistent Preference** — language saved to localStorage

### User Experience
- 📱 **Responsive Design** — works on mobile, tablet, and desktop
- 🎨 **Material Design UI** — Angular Material components
- 🔊 **Audio Alerts** — sound notifications for low stock/expiry
- 🔔 **Real-Time Notifications** — in-app toast & panel
- ⚡ **Fast Loading** — full lazy loading for all feature modules

---

## 🔒 Security

| Layer | Mechanism |
|-------|-----------|
| **Authentication** | JWT (Access + Refresh Tokens) |
| **Authorization** | Role-Based Access Control (RBAC) |
| **Transport** | HTTPS + Bearer Authorization Headers |
| **Interception** | HTTP Interceptors for automatic token injection |
| **Routing** | Route Guards (`authGuard` + `roleGuard`) |
| **Error Handling** | Centralized Error Interceptor |
| **Storage** | Secure localStorage with token management |
| **Auto-Logout** | On token expiry or 401 response |

---

## 📋 Prerequisites

| Requirement | Version |
|-------------|---------|
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
|---------|-------------|
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
  appName: 'SmartPharma'
};
```

### Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.smartpharma.eg/api',
  appVersion: '1.0.0',
  appName: 'SmartPharma'
};
```

---

## 🎨 Design Token Palette

```
🟢 Primary:    #10b981 (Emerald Green)
🟣 Secondary:  #8b5cf6 (Violet)
🟡 Warning:    #f59e0b (Amber)
🔵 Info:       #3b82f6 (Blue)
```

---

## 📁 Folder Structure

```
smartpharma-frontend/
├── public/                          # Static assets
│   └── favicon.ico
├── src/
│   ├── index.html                   # Entry HTML (RTL by default)
│   ├── main.ts                      # Bootstrap entry point
│   ├── styles.scss                  # Global styles
│   ├── polyfills.ts                 # Zone.js polyfills
│   ├── app/
│   │   ├── app.ts                   # Root component
│   │   ├── app.config.ts            # App configuration & providers
│   │   ├── app.routes.ts            # Top-level route definitions
│   │   ├── core/                    # Core layer (guards, interceptors, models, services, utils)
│   │   ├── features/                # Feature modules (auth, dashboard, products, stock, etc.)
│   │   ├── layouts/                 # Layout components (auth-layout, main-layout)
│   │   └── shared/                  # Shared components, directives, models, services
│   ├── assets/
│   │   ├── i18n/                    # Translation files (ar.json, en.json)
│   │   └── images/                  # Static images
│   └── environments/                # Environment configs
│       ├── environment.ts           # Development
│       └── environment.prod.ts      # Production
├── angular.json                     # Angular CLI configuration
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.app.json                # App-specific TS config
├── tsconfig.spec.json               # Test-specific TS config
├── .editorconfig                    # Editor settings
└── .gitignore                       # Git ignore rules
```

---

## 📝 Important Technical Notes

### 🏆 Why This Project Stands Out (CV/Resume Highlights)

- ✅ **Angular 21 Standalone Components** — Zero `NgModule`s! 100% modern, future-proof architecture
- ✅ **Advanced Lazy Loading** — Every feature module loads independently for optimal performance
- ✅ **18 Business Services** — Comprehensive service layer covering all pharmacy operations
- ✅ **20+ TypeScript Models** — Rich domain modeling with interfaces, enums, and union types
- ✅ **Full RBAC System** — Multi-layered Guards + Interceptors for enterprise-grade auth
- ✅ **Advanced State Management** — Angular Signals combined with RxJS observables
- ✅ **Centralized Error Handling** — Error Interceptor + Error Handler Service pipeline
- ✅ **Complete i18n** — Full Arabic RTL & English LTR with `ngx-translate`
- ✅ **Responsive Design** — Works seamlessly on mobile, tablet, and desktop
- ✅ **Unit Testing** — Modern Vitest test runner with JSDOM
- ✅ **REST API Integration** — HttpClient interceptors + Axios for robust HTTP layer
- ✅ **Interactive Charts** — Chart.js + ng2-charts for data visualization
- ✅ **Unified Pagination** — Reusable pagination patterns across all list views
- ✅ **Clean Code Architecture** — Strict separation of concerns (core / features / shared / layouts)
- ✅ **Multi-Gateway Payments** — 6 payment methods with full refund lifecycle
- ✅ **AI Features** — Demand prediction engine with trend analysis and confidence scoring

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

*Last Updated: July 2025 | Version 1.0.0*

</div>
