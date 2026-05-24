/**
 * HWstore — PC Configurateur Page
 * Uses BuilderStateService (signals) for all state.
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  BUILD_SLOT_ORDER,
  BuildSlot,
  SLOT_ICONS,
  SLOT_LABELS,
} from '../../core/models/build-state.model';
import { ScoredComposant } from '../../core/models/recommendation.model';
import { CartService } from '../../core/services/cart.service';
import { BuilderStateService } from '../../core/services/builder-state.service';

@Component({
  selector: 'app-configurateur',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configurateur.html',
})
export class ConfigurateurComponent {
  readonly state = inject(BuilderStateService);
  private cartService = inject(CartService);
  readonly labels = SLOT_LABELS;
  readonly icons = SLOT_ICONS;
  readonly slots = BUILD_SLOT_ORDER;
  readonly build = this.state.build;
  readonly active = this.state.activeSlot;

  constructor() {
    this.state.openSlotPicker('motherboard');
  }

  // Slot picker actions
  open(slot: BuildSlot, event: Event): void {
    event.stopPropagation();
    this.state.openSlotPicker(slot);
  }

  remove(slot: BuildSlot, event: Event): void {
    event.stopPropagation();
    this.state.removeComposant(slot);
  }

  pick(scored: ScoredComposant): void {
    const slot = this.active();
    if (slot) this.state.selectComposant(slot, scored.composant);
  }

  close(): void {
    this.state.closeSlotPicker();
  }
  reset(): void {
    this.state.resetBuild();
  }

  // Compatibility score → colour
  scoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  }

  // Keep existing price formatter (DZD)
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-DZ').format(Number(price)) + ' DA';
  }

  addBuildToCart(): void {
    const build = this.build();
    const filled = BUILD_SLOT_ORDER.map((slot) => build[slot]).filter((c) => !!c);

    if (filled.length === 0) return;

    filled.forEach((composant) => this.cartService.addToCart(composant, 1));
  }

  isSlotFilled(slot: BuildSlot): boolean {
    return !!this.build()[slot];
  }

  isActiveSlot(slot: BuildSlot): boolean {
    return this.active() === slot;
  }
}
