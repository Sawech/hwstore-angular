/**
 * HWstore — Composants page
 */

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { Composant, SubCategory } from '../../core/models/client.model';
import { ComposantCardComponent } from '../../shared/composant-card/composant-card';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating';

@Component({
  selector: 'app-composant',
  standalone: true,
  imports: [FormsModule, ComposantCardComponent],
  templateUrl: './composants.html',
})
export class ComposantsComponent implements OnInit {
  private clientService = inject(ClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allComposants = signal<Composant[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  readonly itemsPerPage = 12;

  selectedTags = signal<Record<string, string[]>>({});
  priceMax = signal(900000);
  priceMin = signal(0);
  sortBy = signal<SortOption>('newest');
  currentSousCategory = signal<SubCategory | null>(null);
  minPercent = computed(() => (this.priceMin() / 900000) * 100);
  maxPercent = computed(() => (this.priceMax() / 900000) * 100);

  tagGroups(): string[] {
    return Object.keys(this.currentSousCategory()?.tags ?? {});
  }

  filteredComposants = computed(() => {
    let list = this.allComposants();

    list = list.filter((p) => p.price >= this.priceMin() && p.price <= this.priceMax());

    switch (this.sortBy()) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        );
    }

    return list;
  });

  pagedComposants = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredComposants().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredComposants().length / this.itemsPerPage));

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  onPriceMinChange(value: number): void {
    if (value >= this.priceMax()) return;
    this.priceMin.set(value);
    this.currentPage.set(1);
  }

  ngOnInit(): void {
    let sousCategory = history.state?.sousCategory;
    if (sousCategory) {
      this.currentSousCategory.set(sousCategory);
    } else {
      const subCategoryId = Number(this.route.snapshot.paramMap.get('subCategoryId'));
      this.clientService.getSousCategoryById(subCategoryId).subscribe({
        next: (sc) => {
          this.currentSousCategory.set(sc);
          sousCategory = sc;
        },
      });
    }
    if (!sousCategory) {
      this.router.navigate(['/sous-categories']);
      return;
    }
    console.log('sousCategory', sousCategory);
    this.clientService
      .getComposants({ subcategory: Number(sousCategory.id), limit: 12 })
      .subscribe({
        next: (res) => {
          console.log('Composants response:', res);
          this.allComposants.set(res.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.allComposants.set([]);
          this.isLoading.set(false);
        },
      });
  }

  selectedTag(group: string, value: string): void {
    this.selectedTags.update((tags) => {
      const currentValues = tags[group] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      const next = { ...tags, [group]: newValues };
      if (newValues.length === 0) delete next[group];
      return next;
    });
    this.currentPage.set(1);
    this.fetchComposants();
  }

  private fetchComposants(): void {
    const subcategoryId = Number(this.currentSousCategory()?.id);
    const tags = this.selectedTags();
    this.isLoading.set(true);
    this.clientService
      .getComposants({
        subcategory: subcategoryId,
        ...(Object.keys(tags).length > 0 ? { tags } : {}),
        limit: 100,
      })
      .subscribe({
        next: (res) => {
          this.allComposants.set(res.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.allComposants.set([]);
          this.isLoading.set(false);
        },
      });
  }

  onSortChange(value: string): void {
    this.sortBy.set(value as SortOption);
    this.currentPage.set(1);
  }

  onPriceChange(value: number): void {
    if (value <= this.priceMin()) return;
    this.priceMax.set(value);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.priceMin.set(0);
    this.priceMax.set(900000);
    this.sortBy.set('newest');
    this.currentPage.set(1);
    this.fetchComposants();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-DZ').format(price) + ' DA';
  }
}
