import { Category } from '../../core/models/product.model';

export const STATUS_MAP = {
  waiting: 'En attente',
  active: 'En cours',
  checked_out: 'Livré',
  abandoned: 'Annulé',
} as const;

export type StatusCode = keyof typeof STATUS_MAP;
export type StatusLabel = (typeof STATUS_MAP)[StatusCode];

export function toLabel(status: StatusCode): string {
  return STATUS_MAP[status] ?? status;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalStock: number;
  salesTrend: number;
  ordersTrend: number;
  usersTrend: number;
}
export interface ChartPoint {
  day: string;
  value: number;
  height: string;
}
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
export interface AdminCart {
  id: number;
  items: AdminCartItem[];
  user: User;
  status: StatusCode;
  createdAt: string;
  sessionToken: string;
  orderRef: string;
}
export interface AdminCartItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}
export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  subcategory: AdminSubCategory[];
}
export interface AdminSubCategoryPayload {
  id: number;
  name: string;
  slug: string;
  description?: string;
  tags?: Record<string, string[]>;
  image?: string;
  category?: number;
  new?: boolean;
  imageUpdated?: boolean;
}
export interface AdminSubCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  tags?: Record<string, string[]>;
  image?: string;
  category?: Category;
  new?: boolean;
  imageUpdated?: boolean;
}
export interface AdminComponent {
  id: string;
  name: string;
  slug: string;
  brand: string;
  subcategory: AdminSubCategory;
  price: number;
  images: string[];
  specs: Record<string, any>;
  tags?: Record<string, string[]>;
  stock: number;
  badge: string;
  description: string;
  createdAt: string;
}
export interface AdminComponentPayload {
  id: string;
  name: string;
  slug: string;
  brand: string;
  subcategory: number;
  price: number;
  images: string[];
  specs: Record<string, any>;
  tags?: Record<string, any>;
  stock: number;
  badge: string;
  description: string;
  createdAt: string;
}
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
