/**
 * HWstore — Header Component
 */

import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../features/auth/auth.service';
import { ClientService } from '../../core/services/client.service';
import { Category } from '../../core/models/client.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class HeaderComponent implements OnInit {
  private cartService = inject(CartService);
  authService = inject(AuthService);
  private api = inject(ClientService);

  categories = signal<Category[]>([]);
  readonly cartItems = this.cartService.items;
  isCategoryMenuOpen = signal(false);
  cartCount = this.cartService.count;

  isMobileMenuOpen = signal(false);

  isAccountMenuOpen = signal(false);
  isCartPreviewOpen = signal(false);

  private cartMenuTimeout: ReturnType<typeof setTimeout> | null = null;

  openCartPreview(): void {
    if (this.cartMenuTimeout) {
      clearTimeout(this.cartMenuTimeout);
      this.cartMenuTimeout = null;
    }
    this.isCartPreviewOpen.set(true);
  }

  closeCartPreviewDelayed(): void {
    this.cartMenuTimeout = setTimeout(() => {
      this.isCartPreviewOpen.set(false);
    }, 200);
  }

  readonly navLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Catégories', path: '/categories' },
    { label: 'Configurateur', path: '/configurateur-pc' },
    { label: 'Contact', path: '/contact' },
    { label: 'Commandes', path: '/commandes' },
  ];

  ngOnInit(): void {
    this.api.getCategories().subscribe({
      next: (res) => {
        return this.categories.set(res.data);
      },
    });
  }

  private categoryMenuTimeout: ReturnType<typeof setTimeout> | null = null;

  openCategoryMenu(): void {
    console.log(this.cartItems());
    if (this.categoryMenuTimeout) {
      clearTimeout(this.categoryMenuTimeout);
      this.categoryMenuTimeout = null;
    }
    this.isCategoryMenuOpen.set(true);
  }

  closeCategoryMenuDelayed(): void {
    this.categoryMenuTimeout = setTimeout(() => {
      this.isCategoryMenuOpen.set(false);
    }, 200);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleAccountMenu(): void {
    this.isAccountMenuOpen.update((v) => !v);
  }

  closeAccountMenu(): void {
    this.isAccountMenuOpen.set(false);
  }

  logout(): void {
    this.closeAccountMenu();
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#account-menu-wrapper')) {
      this.isAccountMenuOpen.set(false);
    }
  }
}
