/**
 * HWstore — Core Data Models
 */

export type ComposantType =
  | 'boitier'
  | 'processeur'
  | 'carte-mere'
  | 'ram'
  | 'stockage'
  | 'gpu'
  | 'alimentation'
  | 'refroidissement';
// | 'other'

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
  composantName: string;
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
  composant: { id: number; name: string; price: number };
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

export interface ComposantPayload {
  composant: Composant;
  quantity: number;
}

export interface Composant {
  id: number;
  name: string;
  slug: string;
  brand: string;
  subCategory: number;
  price: number;
  rating: number;
  images: string[];
  tags: Record<string, string[]>;
  type: ComposantType;
  stock: number;
  // badge?: 'Premium' | 'Nouveau' | 'Elite' | 'Promo';
  description?: string;
  specs: Record<string, string | number | string[]>;
  createdAt?: string;
}

export interface ComposantsResponse {
  data: Composant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetComposantsParams {
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
  composantCount?: number;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  tags?: Record<string, string[]>;
  category?: Category;
  composantCount?: number;
}

export interface ConfiguratorComposant {
  id: string;
  type: ComposantType;
  name: string;
  price: number;
  image: string;
  description: string;
  tags: string[];
  wattage?: number;
}

export interface BuildState {
  boitier?: ConfiguratorComposant;
  processeur?: ConfiguratorComposant;
  'carte-mere'?: ConfiguratorComposant;
  ram?: ConfiguratorComposant;
  stockage?: ConfiguratorComposant;
  gpu?: ConfiguratorComposant;
  alimentation?: ConfiguratorComposant;
  refroidissement?: ConfiguratorComposant;
}

export interface BuildStep {
  key: ComposantType;
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
  composants: ConfiguratorComposant[];
  estimatedWattage: number;
  compatibilityScore: number;
}

export interface CategoryListResponse {
  data: Category[];
}
