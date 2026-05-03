/**
 * HWstore — Core Data Models
 */

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

export interface CartResponse {
  id: number;
  items: CartResponseItem[];
  status: StatusCode;
  createdAt: string;
  sessionToken: string;
  orderRef: string;
}

export interface CartResponseItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CartMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CartOrderItem {
  id: number;
  product: { id: string; name: string; price: number };
  quantity: number;
  unitPrice: number;
}

export interface CartOrder {
  id: number;
  orderRef: string;
  status: StatusCode;
  createdAt: string;
  sessionToken: string;
  items: CartOrderItem[];
}

export interface ProductPayload {
  product: Product;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  subCategory: number;
  price: number;
  rating: number;
  images: string[];
  tags: Record<string, string[]>;
  badge?: 'Premium' | 'Nouveau' | 'Elite' | 'Promo';
  description?: string;
  shortDescription?: string;
  specs: Record<string, string>;
  createdAt?: string;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetProductsParams {
  subcategory?: number;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  tags?: Record<string, string[]>;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  tags?: Record<string, string[]>;
  category?: Category;
  productCount?: number;
}

export type ComponentType =
  | 'boitier'
  | 'processeur'
  | 'carte-mere'
  | 'ram'
  | 'stockage'
  | 'gpu'
  | 'alimentation'
  | 'refroidissement';

export interface ConfiguratorComponent {
  id: string;
  type: ComponentType;
  name: string;
  price: number;
  image: string;
  description: string;
  tags: string[];
  wattage?: number;
}

export interface BuildState {
  boitier?: ConfiguratorComponent;
  processeur?: ConfiguratorComponent;
  'carte-mere'?: ConfiguratorComponent;
  ram?: ConfiguratorComponent;
  stockage?: ConfiguratorComponent;
  gpu?: ConfiguratorComponent;
  alimentation?: ConfiguratorComponent;
  refroidissement?: ConfiguratorComponent;
}

export interface BuildStep {
  key: ComponentType;
  label: string;
  icon: string;
  stepNumber: string;
}

export interface CalculateBuildRequest {
  boitierId?: string;
  processeurId?: string;
  cartemereId?: string;
  ramId?: string;
  stockageId?: string;
  gpuId?: string;
  alimentationId?: string;
  refroidissementId?: string;
}

export interface CalculateBuildResponse {
  total: number;
  components: ConfiguratorComponent[];
  estimatedWattage: number;
  compatibilityScore: number;
}

export interface CategoryListResponse {
  data: Category[];
}
