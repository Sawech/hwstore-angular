import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../core/admin-api.service';
import { AdminCart, ChartPoint, DashboardStats } from '../core/admin.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class DashBoardComponent implements OnInit {
  private api = inject(AdminApiService);

  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<AdminCart[]>([]);
  chart = signal<ChartPoint[]>([]);
  loadingOrders = signal(true);

  ngOnInit(): void {
    this.api.getStats().subscribe({ next: (s) => this.stats.set(s), error: () => {} });
    this.api.getSalesChart().subscribe({ next: (c) => this.chart.set(c), error: () => {} });
    this.api.getRecentOrders().subscribe({
      next: (o) => {
        this.recentOrders.set(o);
        this.loadingOrders.set(false);
      },
      error: () => this.loadingOrders.set(false),
    });
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-DZ').format(amount) + ' DA';
  }

  formatCartPrice(cart: AdminCart): string {
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.unitPrice * item.quantity;
    }, 0);
    return new Intl.NumberFormat('fr-DZ').format(totalAmount) + ' DA';
  }

  getBarColor(value: number): string {
    const alpha = Math.round((value / 100) * 0.9 * 255)
      .toString(16)
      .padStart(2, '0');
    return `#a82b55${alpha}`;
  }

  getStatusClass(status: string): Record<string, boolean> {
    return {
      'bg-tertiary-fixed text-on-tertiary-fixed': status === 'Livré',
      'bg-primary-fixed text-on-primary-fixed': status === 'En attente',
      'bg-error-container text-on-error-container': status === 'Annulé',
      'bg-secondary-container text-on-secondary-container': status === 'En cours',
    };
  }

  getStatusDot(status: string): Record<string, boolean> {
    return {
      'bg-tertiary': status === 'Livré',
      'bg-primary': status === 'En attente',
      'bg-error': status === 'Annulé',
      'bg-secondary': status === 'En cours',
    };
  }
}
