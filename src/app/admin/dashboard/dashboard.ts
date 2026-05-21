import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../core/admin-api.service';
import {
  AdminCart,
  ChartPoint,
  DashboardStats,
  PaginatedResponse,
  StatusCode,
  toLabel,
} from '../core/admin.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class DashBoardComponent implements OnInit {
  private api = inject(AdminApiService);

  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<PaginatedResponse<AdminCart> | null>(null);
  chart = signal<ChartPoint[]>([]);
  loadingOrders = signal(true);
  page = signal(1);
  readonly pageSize = 5;
  readonly toLabel = toLabel;
  private readonly time = signal<string>('month');
  activeStatusMenu = signal<number | null>(null);
  editableStatuses = ['En attente', 'En cours', 'Livré', 'Annulé'];

  ngOnInit(): void {
    this.api.getStats().subscribe({
      next: (s) => {
        console.log('s', s);
        this.stats.set(s);
        this.chart.set(this.buildChart(s.commandes));
        this.recentOrders.set({
          data: s.commandes,
          total: s.commandes.length,
          page: 1,
          limit: 5,
          totalPages: Math.ceil(s.commandes.length / 5),
        });
        this.loadingOrders.set(false);
      },
      error: () => this.loadingOrders.set(false),
    });
  }

  totalSales() {
    const commandeItems = this.stats()?.commandes.flatMap((commande) => commande.items);
    return commandeItems?.reduce((next, item) => next + item.unitPrice * item.quantity, 0) ?? 0;
  }

  pagedOrders() {
    const start = (this.page() - 1) * this.pageSize;
    return this.stats()?.commandes.slice(start, start + this.pageSize) ?? [];
  }

  totalPages() {
    return Math.ceil((this.stats()?.commandes.length ?? 0) / this.pageSize);
  }

  prevPage(): void {
    if (this.page() > 1) this.page.update((p) => p - 1);
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) this.page.update((p) => p + 1);
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

  changeTime(time: string) {
    if (this.time() === time) return;
    this.time.set(time);

    const allOrders = this.recentOrders()?.data ?? [];

    const filtered =
      time === 'week'
        ? allOrders.filter((order) => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return new Date(order.createdAt) >= sevenDaysAgo;
          })
        : allOrders;

    this.stats.update((st) => (st ? { ...st, commandes: filtered } : st));
  }

  toggleStatusMenu(id: number): void {
    this.activeStatusMenu.set(this.activeStatusMenu() === id ? null : id);
  }

  updateStatus(id: number, status: string): void {
    this.activeStatusMenu.set(null);
    let st = '';
    switch (status) {
      case 'En attente':
        st = 'waiting';
        break;
      case 'En cours':
        st = 'active';
        break;
      case 'Livré':
        st = 'checked_out';
        break;
      case 'Annulé':
        st = 'abandoned';
        break;
      default:
        return;
    }
    this.api.updateOrderStatus(id, st).subscribe({
      next: () => {
        const current = this.stats();
        if (current) {
          this.stats.set({
            ...current,
            commandes: current.commandes.map((c) =>
              c.id === id ? { ...c, status: st as StatusCode } : c,
            ),
          });
        }
      },
      error: () => {},
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  buildChart(commandes: AdminCart[]): ChartPoint[] {
    const days = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recent = commandes.filter((order) => new Date(order.createdAt) >= sevenDaysAgo);

    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const order of recent) {
      const dayIndex = new Date(order.createdAt).getDay();
      counts[dayIndex]++;
    }

    const max = Math.max(...Object.values(counts), 1);

    return days.map((day, i) => {
      const value = counts[i];
      const heightPct = Math.round((value / max) * 100);
      return {
        day,
        count: counts[i],
        value: heightPct,
        height: `${heightPct}%`,
      };
    });
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
      'bg-orange-500': status === 'En attente',
      'bg-error': status === 'Annulé',
      'bg-secondary': status === 'En cours',
    };
  }
}
