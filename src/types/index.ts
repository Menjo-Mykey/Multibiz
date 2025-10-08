export type BusinessType = 'triplek' | 'swan';

export type UserRole = 'owner' | 'admin' | 'manager' | 'barber' | 'sales_agent' | 'accountant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  business_id?: string;
  commission_rate?: number; // For barbers
  is_active: boolean;
  created_at: string;
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
}

export interface Sale {
  id: string;
  business_id: string;
  user_id: string; // Barber or sales agent
  customer_name?: string;
  customer_contact?: string;
  total_amount: number;
  payment_method: 'cash' | 'mpesa' | 'card' | 'bank_transfer';
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id?: string;
  service_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Commission {
  id: string;
  user_id: string;
  sale_id: string;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'paid';
  created_at: string;
  paid_at?: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  user_id: string;
  created_at: string;
}

export interface DashboardStats {
  total_revenue: number;
  total_sales: number;
  total_commissions: number;
  low_stock_alerts: number;
  period_start: string;
  period_end: string;
}