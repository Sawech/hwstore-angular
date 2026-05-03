import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../core/config/app-config';
import {
  AdminCategory,
  AdminComponent,
  AdminComponentPayload,
  AdminCart,
  AdminSubCategory,
  AdminSubCategoryPayload,
  ChartPoint,
  DashboardStats,
  PaginatedResponse,
} from './admin.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private base = `${AppConfig.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/dashboard/stats`);
  }
  getRecentOrders(): Observable<AdminCart[]> {
    return this.http.get<AdminCart[]>(`${this.base}/dashboard/recent-orders`);
  }
  getSalesChart(): Observable<ChartPoint[]> {
    return this.http.get<ChartPoint[]>(`${this.base}/dashboard/sales-chart`);
  }

  getCategories(page = 1, limit = 12): Observable<PaginatedResponse<AdminCategory>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaginatedResponse<AdminCategory>>(`${this.base}/category`, { params });
  }
  getCategoryById(id: number): Observable<AdminCategory> {
    return this.http.get<AdminCategory>(`${this.base}/category/${id}`);
  }
  createCategory(data: Partial<AdminCategory>): Observable<AdminCategory> {
    return this.http.post<AdminCategory>(`${this.base}/category`, data);
  }
  updateCategory(id: number, data: Partial<AdminCategory>): Observable<AdminCategory> {
    return this.http.put<AdminCategory>(`${this.base}/category/${id}`, data);
  }
  deleteCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/category/${id}`);
  }

  getSubCategories(): Observable<AdminSubCategory[]> {
    return this.http.get<AdminSubCategory[]>(`${this.base}/subcategory`);
  }
  addSubcategory(payload: Omit<AdminSubCategoryPayload, 'id'>): Observable<AdminSubCategory> {
    return this.http.post<AdminSubCategory>(`${this.base}/subcategory`, payload, {
      withCredentials: true,
    });
  }
  updateSubCategory(
    id: number,
    data: Partial<AdminSubCategoryPayload>,
  ): Observable<AdminSubCategory> {
    return this.http.put<AdminSubCategory>(`${this.base}/subcategory/${id}`, data, {
      withCredentials: true,
    });
  }
  deleteSubCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/subcategory/${id}`);
  }

  getComponents(params?: Record<string, any>): Observable<PaginatedResponse<AdminComponent>> {
    let httpParams = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') httpParams = httpParams.set(k, String(v));
      });
    return this.http.get<PaginatedResponse<AdminComponent>>(`${this.base}/components`, {
      params: httpParams,
    });
  }
  getComponentById(id: string): Observable<AdminComponent> {
    return this.http.get<AdminComponent>(`${this.base}/components/${id}`);
  }

  createComponent(data: Partial<AdminComponentPayload>): Observable<AdminComponentPayload> {
    return this.http.post<AdminComponentPayload>(`${this.base}/components`, data);
  }

  updateComponent(
    id: string,
    data: Partial<AdminComponentPayload>,
  ): Observable<AdminComponentPayload> {
    return this.http.put<AdminComponentPayload>(`${this.base}/components/${id}`, data);
  }
  uploadImage(formData: FormData): Observable<{ url: string; publicId: string }> {
    return this.http.post<{ url: string; publicId: string }>(
      `${this.base}/components/uploadImage`,
      formData,
    );
  }
  deleteComponent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/components/${id}`);
  }

  getOrders(params?: Record<string, any>): Observable<PaginatedResponse<AdminCart>> {
    let httpParams = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') httpParams = httpParams.set(k, String(v));
      });
    return this.http.get<PaginatedResponse<AdminCart>>(`${this.base}/cart`, {
      params: httpParams,
    });
  }
  getOrderById(id: number): Observable<AdminCart> {
    return this.http.get<AdminCart>(`${this.base}/cart/${id}`);
  }
  updateOrderStatus(id: number, status: string): Observable<AdminCart> {
    console.log(status);
    return this.http.patch<AdminCart>(`${this.base}/cart/${id}/status`, { status });
  }
}
