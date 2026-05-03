/**
 * HWstore — Categories Page
 * Affiche toutes les catégories de produits dans un bento grid éditorial.
 * Utilise le ProductService avec fallback sur les données mock.
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Category } from '../../core/models/product.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
  private productService = inject(ProductService);

  categories = signal<Category[]>([]);
  isLoading = signal(true);

  readonly subCategories: Record<string, string[]> = {
    'ordinateurs-portables': ['Ultrabooks Pro', 'Workstations', 'MacBook & Surface'],
    'bureau-gaming': ['PC Gamer Custom', 'Accessoires Razer/Logitech', 'Sièges Ergonomiques'],
    composants: ['GPU NVIDIA & AMD', 'CPUs Haute Performance', 'RAM & SSD NVMe'],
    peripheriques: ['Écrans 4K & Ultrawide', 'Claviers Mécaniques', 'Systèmes Audio Pro'],
    'reseautage-serveurs': ['Solutions NAS Pro', 'Réseau & Switch', 'Baies & Rack'],
    'logiciels-services': ['Licences OS & Suite', 'Cybersécurité Pro', 'Cloud & Backup'],
  };

  readonly categoryIcons: Record<string, string> = {
    'ordinateurs-portables': 'laptop',
    'bureau-gaming': 'sports_esports',
    composants: 'memory',
    peripheriques: 'monitor',
    'reseautage-serveurs': 'dns',
    'logiciels-services': 'code',
  };

  readonly categoryRoutes: Record<string, string> = {
    'ordinateurs-portables': '/ordinateurs-portables',
    'bureau-gaming': '/ordinateurs-portables',
    composants: '/configurateur-pc',
    peripheriques: '/ordinateurs-portables',
    'reseautage-serveurs': '/ordinateurs-portables',
    'logiciels-services': '/ordinateurs-portables',
  };

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  getSubCategories(slug: string): string[] {
    return this.subCategories[slug] ?? ['Découvrir les produits'];
  }

  getIcon(slug: string): string {
    return this.categoryIcons[slug] ?? 'category';
  }

  getRoute(slug: string): string {
    return this.categoryRoutes[slug] ?? '/';
  }
}
