/**
 * HWstore — Composant Card Component
 */

import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Composant } from '../../core/models/client.model';

@Component({
  selector: 'app-composant-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './composant-card.html',
})
export class ComposantCardComponent {
  composant = input.required<Composant>();
  variant = input<'grid' | 'list'>('grid');

  private cartService = inject(CartService);

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(this.composant());
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-DZ').format(price) + ' DA';
  }

  get stars(): boolean[] {
    const rating = Math.round(this.composant().rating);
    return Array(5)
      .fill(false)
      .map((_, i) => i < rating);
  }
}
