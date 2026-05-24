/**
 * HWstore — Composant Service
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config/app-config';
import { AuthService } from '../../features/auth/auth.service';
import {
  CartMeta,
  CartOrder,
  CartResponse,
  CategoryListResponse,
  GetComposantsParams,
  Composant,
  ComposantPayload,
  ComposantsResponse,
  SubCategory,
} from '../models/client.model';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  getComposants(params?: GetComposantsParams): Observable<ComposantsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      const { tags, ...rest } = params;

      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });

      if (tags && Object.keys(tags).length > 0) {
        httpParams = httpParams.set('tags', JSON.stringify(tags));
      }
    }
    return this.http.get<ComposantsResponse>(`${this.apiUrl}/composants`, { params: httpParams });
  }

  getComposantById(id: string): Observable<Composant> {
    return this.http.get<Composant>(`${this.apiUrl}/composants/${id}`);
  }

  getComposantsByType(type: string): Observable<Composant[]> {
    return this.http.get<Composant[]>(`${this.apiUrl}/composants/type/${type}`);
  }

  getCategories(): Observable<CategoryListResponse> {
    return this.http.get<CategoryListResponse>(`${this.apiUrl}/category`);
  }

  getSousCategories(): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(`${this.apiUrl}/subcategory`);
  }

  getSousCategoryById(id: number): Observable<SubCategory> {
    return this.http.get<SubCategory>(`${this.apiUrl}/subcategory/${id}`);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-DZ').format(price) + ' DA';
  }

  sendPayment(items: ComposantPayload[]): Observable<CartResponse> {
    const user = this.authService.getUser();

    const amount = items.reduce((total, item) => total + item.composant.price * item.quantity, 0);

    const payload = {
      totalPrice: amount,
      items: items.map((i) => ({
        composantId: i.composant.id,
        quantity: i.quantity,
        unitPrice: i.composant.price,
      })),
      userId: user?.id ?? null,
    };
    return this.http.post<CartResponse>(`${this.apiUrl}/cart`, payload);

    // this.http.post<any>(`${AppConfig.apiUrl}/cart/checkout`, payload).subscribe({
    //   next: (data) => {
    //     console.log('checkout response:', data);
    //     if (data.checkout_url) {
    //       window.location.href = data.checkout_url;
    //     }
    //   },
    //   error: (err) => console.error('Erreur lors du checkout:', err),
    // });
  }

  getCartByCheckout(checkoutId: string): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.apiUrl}/cart/${checkoutId}`);
  }

  getBill(checkoutId: string): Observable<any> {
    const res = this.http.get<any>(`${this.apiUrl}/cart/bill/${checkoutId}`);
    console.log(res);
    return res;
  }

  getCarts(page = 1, limit = 8): Observable<{ data: CartOrder[]; meta: CartMeta }> {
    const user = this.authService.getUser();
    let httpParams = new HttpParams();
    httpParams = httpParams.set('userId', user?.id ?? '');
    httpParams = httpParams.set('page', page);
    httpParams = httpParams.set('limit', limit);
    return this.http.get<{ data: CartOrder[]; meta: CartMeta }>(`${this.apiUrl}/cart/orders`, {
      params: httpParams,
    });
  }

  getCart(id: number): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.apiUrl}/cart/${id}`);
  }
}
