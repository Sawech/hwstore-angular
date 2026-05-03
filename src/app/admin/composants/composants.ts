import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminApiService } from '../core/admin-api.service';
import { ToastService } from '../core/toast.service';
import { AdminComponent, AdminSubCategory, PaginatedResponse } from '../core/admin.model';

@Component({
  selector: 'app-admin-composants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './composants.html',
})
export class AdminComposantsComponent implements OnInit {
  private api = inject(AdminApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  result = signal<PaginatedResponse<AdminComponent> | null>(null);
  loading = signal(true);
  page = signal(1);
  searchQuery = signal('');
  categoryFilter = signal('');
  categories = signal<AdminSubCategory[]>([]);

  stats = [
    { label: 'Total Composants', icon: 'memory', iconColor: 'text-primary', value: '—' },
    { label: 'Stock Critique', icon: 'warning', iconColor: 'text-error', value: '—' },
    { label: 'Valeur Stock', icon: 'payments', iconColor: 'text-tertiary', value: '—' },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api
      .getComponents({
        page: this.page(),
        limit: 10,
        search: this.searchQuery(),
        category: this.categoryFilter(),
      })
      .subscribe({
        next: (res) => {
          console.log('Component response:', res);
          this.result.set(res);
          this.stats[0].value = String(res.total);
          const cats = res.data
            .flatMap((c) => c.subcategory ?? [])
            .filter((sub, index, self) => self.findIndex((s) => s.id === sub.id) === index);

          this.categories.set(cats);
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

  onCategoryFilter(e: Event): void {
    this.categoryFilter.set((e.target as HTMLSelectElement).value);
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

  goToNew(): void {
    this.router.navigate(['/admin/composants/new']);
  }

  deleteComponent(id: string): void {
    if (!confirm('Supprimer ce composant ?')) return;
    this.api.deleteComponent(id).subscribe({
      next: () => {
        this.toast.success('Composant supprimé');
        this.loadData();
      },
      error: () => this.toast.error('Erreur lors de la suppression'),
    });
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fr-DZ').format(p) + ' DA';
  }
}
