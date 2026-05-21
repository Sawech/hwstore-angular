/**
 * HWstore — Cart Service
 */

import { computed, inject, Injectable, signal } from '@angular/core';
import { ComposantPayload, Composant } from '../models/client.model';
import { AuthService } from '../../features/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private authService = inject(AuthService);
  private _items = signal<ComposantPayload[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.composant.price * item.quantity, 0),
  );

  addToCart(composant: Composant, quantity = 1): void {
    this._items.update((current) => {
      const existing = current.find((item) => item.composant.id === composant.id);
      if (existing) {
        return current.map((item) =>
          item.composant.id === composant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [{ composant, quantity }, ...current];
    });
    this.saveToStorage();
  }

  removeFromCart(composantId: number): void {
    this._items.update((current) => current.filter((item) => !(item.composant.id === composantId)));
    this.saveToStorage();
  }

  updateQuantity(composantId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(composantId);
      return;
    }
    this._items.update((current) =>
      current.map((item) => (item.composant.id === composantId ? { ...item, quantity } : item)),
    );
    this.saveToStorage();
  }

  clearCart(): void {
    this._items.set([]);
    this.saveToStorage();
  }

  private loadFromStorage(): ComposantPayload[] {
    try {
      const saved = localStorage.getItem(this.getStorageKey());
      return saved ? (JSON.parse(saved) as ComposantPayload[]) : [];
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
