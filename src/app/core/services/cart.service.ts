/**
 * HWstore — Cart Service
 */

import { computed, inject, Injectable, signal } from '@angular/core';
import { ProductPayload, Product } from '../models/product.model';
import { AuthService } from '../../features/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private authService = inject(AuthService);
  private _items = signal<ProductPayload[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  addToCart(product: Product, quantity = 1): void {
    this._items.update((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...current, { product, quantity }];
    });
    this.saveToStorage();
  }

  removeFromCart(productId: string): void {
    this._items.update((current) => current.filter((item) => !(item.product.id === productId)));
    this.saveToStorage();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this._items.update((current) =>
      current.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
    );
    this.saveToStorage();
  }

  clearCart(): void {
    this._items.set([]);
    this.saveToStorage();
  }

  private loadFromStorage(): ProductPayload[] {
    try {
      const saved = localStorage.getItem(this.getStorageKey());
      return saved ? (JSON.parse(saved) as ProductPayload[]) : [];
    } catch {
      return [];
    }
  }

  private getStorageKey(): string {
    const user = this.authService.getUser();
    return user ? `hwstore_cart_${user.id}` : 'hwstore_cart_guest';
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this._items()));
    } catch {}
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-DZ').format(amount) + ' DA';
  }
}
