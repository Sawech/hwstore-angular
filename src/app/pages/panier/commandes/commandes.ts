/**
 * HWstore — Mes Commandes Component
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../features/auth/auth.service';
import { CartOrder, CartMeta } from '../../../core/models/product.model';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './commandes.html',
})
export class CommandesComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  carts = signal<CartOrder[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCarts(1);
  }

  loadCarts(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getCarts(page, 8).subscribe({
      next: (res) => {
        console.log(res.data);
        this.carts.set(res.data);
        this.currentPage.set(res.meta.page);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger vos commandes. Veuillez réessayer.');
        this.loading.set(false);
      },
    });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.loadCarts(this.currentPage() + 1);
    }
  }

  showBill(checkoutId: string) {
    this.productService.getBill(checkoutId);
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.loadCarts(this.currentPage() - 1);
    }
  }

  getTotal(cart: CartOrder): number {
    return cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-DZ').format(price) + ' DA';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      checked_out: 'Livré',
      active: 'En cours',
      abandoned: 'Annulé',
      waiting: 'En attente',
    };
    return map[status] ?? status;
  }

  getItemNames(cart: CartOrder): string {
    const names = cart.items.slice(0, 2).map((i) => i.product?.name ?? 'Produit');
    const suffix = cart.items.length > 2 ? `...` : '';
    return names.join(', ') + suffix;
  }
}
