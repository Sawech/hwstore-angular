import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '../core/admin-auth.service';
import { AdminToastComponent } from '../shared/toast/toast';

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AdminToastComponent],
  templateUrl: './layout.html',
})
export class AdminLayoutComponent {
  authService = inject(AdminAuthService);
  sidebarOpen = signal(true);

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Tableau de bord', path: 'dashboard' },
    { icon: 'folder', label: 'Catégories', path: 'categories' },
    { icon: 'folder_special', label: 'Sous-Catégories', path: 'sous-categories' },
    { icon: 'memory', label: 'Composants', path: 'composants' },
    { icon: 'shopping_cart', label: 'Commandes', path: 'commandes' },
  ];
}
