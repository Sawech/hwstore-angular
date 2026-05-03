/**
 * HWstore — Product Card Component
 */

import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  product = input.required<Product>();
  variant = input<'grid' | 'list'>('grid');

  private cartService = inject(CartService);

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(this.product());
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-DZ').format(price) + ' DA';
  }

  get stars(): boolean[] {
    const rating = Math.round(this.product().rating);
    return Array(5)
      .fill(false)
      .map((_, i) => i < rating);
  }
}
