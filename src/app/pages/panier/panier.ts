import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './panier.html',
})
export class PanierComponent {
  readonly cartService = inject(CartService);
  readonly router = inject(Router);
  readonly api = inject(ClientService);

  readonly items = this.cartService.items;
  readonly count = this.cartService.count;
  readonly total = this.cartService.total;

  readonly subtotal = computed(() => this.cartService.total());
  readonly shipping = 0;
  readonly tax = 0;
  readonly grandTotal = computed(() => this.subtotal() + this.shipping + this.tax);

  Pay() {
    this.api
      .sendPayment(this.items())
      .subscribe({ next: (res) => this.router.navigate(['success', res.id]) });
  }

  increment(composantId: number): void {
    const item = this.items().find((i) => i.composant.id === composantId);
    if (item) {
      this.cartService.updateQuantity(composantId, item.quantity + 1);
    }
  }

  decrement(composantId: number): void {
    const item = this.items().find((i) => i.composant.id === composantId);
    if (item) {
      this.cartService.updateQuantity(composantId, item.quantity - 1);
    }
  }

  remove(composantId: number): void {
    this.cartService.removeFromCart(composantId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  formatPrice(amount: number): string {
    return this.cartService.formatPrice(amount);
  }
}
