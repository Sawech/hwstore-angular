import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './panier.component.html',
})
export class PanierComponent {
  readonly cartService = inject(CartService);
  readonly router = inject(Router);
  readonly api = inject(ProductService);

  readonly items = this.cartService.items;
  readonly count = this.cartService.count;
  readonly total = this.cartService.total;

  readonly subtotal = computed(() => this.cartService.total());
  readonly shipping = 0;
  readonly tax = 0;
  readonly grandTotal = computed(() => this.subtotal() + this.shipping + this.tax);

  Pay() {
    this.api.sendPayment(this.items());
  }

  increment(productId: string): void {
    const item = this.items().find((i) => i.product.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  decrement(productId: string): void {
    const item = this.items().find((i) => i.product.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  remove(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  formatPrice(amount: number): string {
    return this.cartService.formatPrice(amount);
  }
}
