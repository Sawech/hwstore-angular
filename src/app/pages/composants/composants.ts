/**
 * HWstore — Products page
 */

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product, SubCategory } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, ProductCardComponent],
  templateUrl: './products.html',
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allProducts = signal<Product[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  readonly itemsPerPage = 12;

  selectedTags = signal<Record<string, string[]>>({});
  priceMax = signal(900000);
  sortBy = signal<SortOption>('newest');
  currentSousCategory = signal<SubCategory | null>(null);

  tagGroups(): string[] {
    return Object.keys(this.currentSousCategory()?.tags ?? {});
  }

  filteredProducts = computed(() => {
    let list = this.allProducts();

    list = list.filter((p) => p.price <= this.priceMax());

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

  pagedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredProducts().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.itemsPerPage));

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit(): void {
    let sousCategory = history.state?.sousCategory;
    if (sousCategory) {
      this.currentSousCategory.set(sousCategory);
    } else {
      const subCategoryId = Number(this.route.snapshot.paramMap.get('subCategoryId'));
      this.productService.getSousCategoryById(subCategoryId).subscribe({
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
    this.productService.getProducts({ subcategory: Number(sousCategory.id), limit: 12 }).subscribe({
      next: (res) => {
        console.log('Products response:', res);
        this.allProducts.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.allProducts.set([]);
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
    this.fetchProducts();
  }

  private fetchProducts(): void {
    const subcategoryId = Number(this.currentSousCategory()?.id);
    const tags = this.selectedTags();
    this.isLoading.set(true);
    this.productService
      .getProducts({
        subcategory: subcategoryId,
        ...(Object.keys(tags).length > 0 ? { tags } : {}),
        limit: 100,
      })
      .subscribe({
        next: (res) => {
          this.allProducts.set(res.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.allProducts.set([]);
          this.isLoading.set(false);
        },
      });
  }

  onSortChange(value: string): void {
    this.sortBy.set(value as SortOption);
    this.currentPage.set(1);
  }

  onPriceChange(value: number): void {
    this.priceMax.set(value);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.selectedTags.set({});
    this.priceMax.set(900000);
    this.sortBy.set('newest');
    this.currentPage.set(1);
    this.fetchProducts();
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
