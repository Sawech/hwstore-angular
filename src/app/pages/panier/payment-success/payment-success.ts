/**
 * HWstore — Payment Success Component
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { CartResponse, toLabel } from '../../../core/models/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-success.html',
})
export class PaymentSuccessComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProductService);
  readonly toLabel = toLabel;

  cart = signal<CartResponse | null>(null);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.cartService.clearCart();

    const checkoutId = this.route.snapshot.queryParamMap.get('checkout_id');

    if (!checkoutId) {
      this.loading.set(false);
      return;
    }

    this.fetchOrderRef(checkoutId, 0);
  }

  private fetchOrderRef(checkoutId: string, attempt: number): void {
    const MAX_ATTEMPTS = 4;
    const DELAY_MS = 1500;

    this.api.getCartByCheckout(checkoutId).subscribe({
      next: (data) => {
        if (data) {
          console.log(data);
          this.cart.set(data);
          this.loading.set(false);
        } else if (attempt < MAX_ATTEMPTS) {
          setTimeout(() => this.fetchOrderRef(checkoutId, attempt + 1), DELAY_MS);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        if (attempt < MAX_ATTEMPTS) {
          setTimeout(() => this.fetchOrderRef(checkoutId, attempt + 1), DELAY_MS);
        } else {
          this.loading.set(false);
        }
      },
    });
  }

  formatPrice(cart: CartResponse): string {
    console.log(cart);
    const totalPrice = cart.items.reduce((total, item) => {
      return total + item.unitPrice * item.quantity;
    }, 0);
    return new Intl.NumberFormat('fr-DZ').format(totalPrice) + ' DA';
  }

  getStatusClass(status: string): Record<string, boolean> {
    return {
      'bg-tertiary-fixed text-on-tertiary-fixed': status === 'Livré',
      'bg-orange-100 text-orange-800': status === 'En attente',
      'bg-error-container text-on-error-container': status === 'Annulé',
      'bg-secondary-container text-on-secondary-container': status === 'En cours',
    };
  }

  getStatusDot(status: string): Record<string, boolean> {
    return {
      'bg-tertiary': status === 'Livré',
      'bg-secondary': status === 'En cours',
      'bg-orange-500': status === 'En attente',
      'bg-error': status === 'Annulé',
    };
  }
}
