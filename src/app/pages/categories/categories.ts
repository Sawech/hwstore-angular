/**
 * HWstore — Categories Page
 * Affiche toutes les catégories de composants dans un bento grid éditorial.
 * Utilise le ComposantService avec fallback sur les données mock.
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { Category } from '../../core/models/client.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categories.html',
})
export class CategoriesComponent implements OnInit {
  private clientService = inject(ClientService);

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
    this.clientService.getCategories().subscribe({
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
    return this.subCategories[slug] ?? ['Découvrir les composants'];
  }

  getIcon(slug: string): string {
    return this.categoryIcons[slug] ?? 'category';
  }

  getRoute(slug: string): string {
    return this.categoryRoutes[slug] ?? '/';
  }
}
