/**
 * HWstore — Product Service
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
  GetProductsParams,
  Product,
  ProductPayload,
  ProductsResponse,
  SubCategory,
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = AppConfig.apiUrl;

  getProducts(params?: GetProductsParams): Observable<ProductsResponse> {
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
    return this.http.get<ProductsResponse>(`${this.apiUrl}/products`, { params: httpParams });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
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

  sendPayment(items: ProductPayload[]): void {
    const user = this.authService.getUser();

    const amount = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

    const payload = {
      amount,
      items: items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.product.price,
      })),
      userId: user?.id ?? null,
    };

    this.http.post<any>(`${AppConfig.apiUrl}/cart/checkout`, payload).subscribe({
      next: (data) => {
        console.log('checkout response:', data);
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }
      },
      error: (err) => console.error('Erreur lors du checkout:', err)
    });
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
    return this.http.get<{ data: CartOrder[]; meta: CartMeta }>(`${this.apiUrl}/cart/orders`, {
      params: { page, limit },
    });
  }
}
