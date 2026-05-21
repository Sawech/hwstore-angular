/**
 * HWstore — Category Page
 */

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { Category, SubCategory } from '../../core/models/client.model';

@Component({
  selector: 'app-sous-categories',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './sous-categories.html',
})
export class SousCategoriesComponent implements OnInit {
  private clientService = inject(ClientService);

  allSousCategories = signal<SubCategory[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  readonly sousCategoriesPerPage = 8;
  private readonly route = inject(ActivatedRoute);

  selectedCategory = signal<Category | null>(null);

  readonly categories = signal<Category[]>([]);

  filteredSousCategories = computed(() => {
    let list = this.allSousCategories();
    if (this.selectedCategory())
      list = list.filter((p) => p.category?.id === this.selectedCategory()?.id);

    return list;
  });

  pagedSousCategories = computed(() => {
    const start = (this.currentPage() - 1) * this.sousCategoriesPerPage;
    return this.filteredSousCategories().slice(start, start + this.sousCategoriesPerPage);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredSousCategories().length / this.sousCategoriesPerPage),
  );

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.clientService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        const categorySlug = this.route.snapshot.paramMap.get('slug');
        if (categorySlug) {
          const category = res.data.find((c) => c.slug === categorySlug);
          if (category) {
            this.selectedCategory.set(category);
          }
        }
      },
    });
    this.clientService.getSousCategories().subscribe({
      next: (res) => {
        this.allSousCategories.set(res);
        this.isLoading.set(false);

        res.forEach((sc) => {
          this.clientService.getComposants({ subcategory: sc.id }).subscribe({
            next: (pRes) => {
              const names = pRes.data.map((p) => p.name);
              this.composantMap.update((map) => ({ ...map, [sc.id]: names }));
              this.allSousCategories.update((list) =>
                list.map((s) => (s.id === sc.id ? { ...s, composantCount: names.length } : s)),
              );
            },
          });
        });
      },
    });
  }

  toggleCategory(category: Category): void {
    // this.selectedCategory.set((cat) => (cat?.id === category.id ? null : category));
    this.selectedCategory.update((cat) => (cat?.id === category.id ? null : category));
    this.filteredSousCategories();
    this.currentPage.set(1);
  }

  readonly composantMap = signal<Record<number, string[]>>({});

  getSComposants(sousCategoryId: number): string[] {
    return this.composantMap()[sousCategoryId] ?? [];
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
