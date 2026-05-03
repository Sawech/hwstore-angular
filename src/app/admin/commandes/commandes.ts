import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminApiService } from '../core/admin-api.service';
import { ToastService } from '../core/toast.service';
import { AdminCart, PaginatedResponse, toLabel } from '../core/admin.model';

const STATUS_OPTIONS = ['Tous les statuts', 'Livré', 'En cours', 'En attente', 'Annulé'];

@Component({
  selector: 'app-admin-commandes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './commandes.html',
  styles: ``,
})
export class AdminCommandesComponent implements OnInit {
  private api = inject(AdminApiService);
  private toast = inject(ToastService);
  readonly toLabel = toLabel;

  result = signal<PaginatedResponse<AdminCart> | null>(null);
  loading = signal(true);
  page = signal(1);
  searchQuery = signal('');
  statusFilter = signal('');
  activeStatusMenu = signal<number | null>(null);

  statusOptions = STATUS_OPTIONS;
  editableStatuses = ['En attente', 'En cours', 'Livré', 'Annulé'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api
      .getOrders({
        page: this.page(),
        limit: 10,
        search: this.searchQuery(),
        status: this.statusFilter(),
      })
      .subscribe({
        next: (res) => {
          console.log('commandes', res);
          this.result.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.page.set(1);
    this.loadData();
  }
  onStatusFilter(e: Event): void {
    this.statusFilter.set((e.target as HTMLSelectElement).value);
    this.page.set(1);
    this.loadData();
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.loadData();
    }
  }
  nextPage(): void {
    if (this.page() < (this.result()?.totalPages ?? 1)) {
      this.page.update((p) => p + 1);
      this.loadData();
    }
  }
  goToPage(p: number): void {
    this.page.set(p);
    this.loadData();
  }
  getPages(): number[] {
    const t = this.result()?.totalPages ?? 1;
    return Array.from({ length: Math.min(t, 5) }, (_, i) => i + 1);
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
        this.toast.success(`Statut mis à jour : ${status}`);
        this.loadData();
      },
      error: () => this.toast.error('Erreur lors de la mise à jour'),
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

  formatPrice(cart: AdminCart): string {
    const totalPrice = cart.items.reduce((total, item) => {
      return total + item.quantity * item.unitPrice;
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
