export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  inventoryValue: number;
}

export interface SaleSummary {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  transactionDate: string;
  customerPhone?: string;
}

export interface TodaySalesResponse {
  totalAmount: number;
  count: number;
  sales: SaleSummary[];
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentSales: SaleSummary[];
  revenueChart?: ChartPoint[];
}

export interface ChartPoint {
  date: string;
  revenue: number;
  orders: number;
}
