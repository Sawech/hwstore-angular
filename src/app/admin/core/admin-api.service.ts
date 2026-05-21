import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../core/config/app-config';
import {
  AdminCategory,
  AdminComposant,
  AdminComposantPayload,
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

  getComposants(params?: Record<string, any>): Observable<PaginatedResponse<AdminComposant>> {
    let httpParams = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') httpParams = httpParams.set(k, String(v));
      });
    return this.http.get<PaginatedResponse<AdminComposant>>(`${this.base}/composants`, {
      params: httpParams,
    });
  }
  getComposantById(id: string): Observable<AdminComposant> {
    return this.http.get<AdminComposant>(`${this.base}/composants/${id}`);
  }

  createComposant(data: Partial<AdminComposantPayload>): Observable<AdminComposantPayload> {
    return this.http.post<AdminComposantPayload>(`${this.base}/composants`, data);
  }

  updateComposant(
    id: string,
    data: Partial<AdminComposantPayload>,
  ): Observable<AdminComposantPayload> {
    return this.http.put<AdminComposantPayload>(`${this.base}/composants/${id}`, data);
  }
  uploadImage(formData: FormData): Observable<{ url: string; publicId: string }> {
    return this.http.post<{ url: string; publicId: string }>(
      `${this.base}/composants/uploadImage`,
      formData,
    );
  }
  deleteComposant(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/composants/${id}`);
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
