/**
 * HWstore — Composant Detail Page
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { CartService } from '../../core/services/cart.service';
import { Composant } from '../../core/models/client.model';

@Component({
  selector: 'app-composant-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './composant-detail.html',
})
export class ComposantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private cartService = inject(CartService);

  composant = signal<Composant | null>(null);
  relatedComposants = signal<Composant[]>([]);
  selectedTags = signal<Record<string, string>>({});
  isLoading = signal(true);

  selectedImageIndex = signal(0);

  selectedRam = signal('16GB');
  selectedStorage = signal('1TB NVMe');

  readonly ramOptions = ['16GB', '32GB', '64GB'];
  readonly storageOptions = ['1TB NVMe', '2TB NVMe'];

  readonly specIcons: Record<string, string> = {
    cpu: 'computer',
    gpu: 'memory',
    display: 'monitor',
    battery: 'battery_charging_full',
    refroidissement: 'ventilator',
    wifi: 'settings_input_component',
    ram: 'memory_alt',
    storage: 'hard_drive',
    weight: 'scale',
  };

  readonly specLabels: Record<string, string> = {
    cpu: 'Processeur',
    gpu: 'Carte Graphique',
    display: 'Écran',
    battery: 'Batterie',
    wifi: 'Connectivité',
    ram: 'Mémoire RAM',
    storage: 'Stockage',
    weight: 'Poids',
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '1';
      this.loadComposant(id);
    });
  }

  private loadComposant(id: string): void {
    this.isLoading.set(true);
    this.selectedImageIndex.set(0);

    this.clientService.getComposantById(id).subscribe({
      next: (composant) => {
        this.composant.set(composant);
        this.isLoading.set(false);
        this.clientService
          .getComposants({ subcategory: composant.subCategory, limit: 4 })
          .subscribe((res) => {
            this.relatedComposants.set(res.data.filter((p) => p.id !== composant.id).slice(0, 4));
          });
      },
      error: () => {
        this.composant.set(null);
        this.relatedComposants.set([]);
        this.isLoading.set(false);
      },
    });
  }

  selectedTag(group: string, value: string): void {
    this.selectedTags.update((tags) => {
      if (tags[group] === value) {
        const { [group]: _, ...rest } = tags;
        return rest;
      }
      return { ...tags, [group]: value };
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  addToCart(): void {
    const p = this.composant();
    if (!p) return;
    this.cartService.addToCart(p, 1);
  }

  tagGroups(): string[] {
    return Object.keys(this.composant()?.tags ?? {});
  }

  buyNow(): void {
    this.addToCart();
  }

  getStarsArray(rating: number): { filled: boolean }[] {
    return Array(5)
      .fill(null)
      .map((_, i) => ({ filled: i < Math.round(rating) }));
  }

  getSpecEntries(): string[] {
    return Object.keys(this.composant()?.specs ?? {});
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-DZ').format(price) + ' DA';
  }
}
