// /**
//  * HWstore — Builder Shell Component
//  * Main entry point for the PC configurator page.
//  */
// import { Component, inject } from '@angular/core';
// import { CommonModule, CurrencyPipe } from '@angular/common';
// import { BuilderStateService } from '../services/builder-state.service';
// import {
//   BUILD_SLOT_ORDER,
//   BuildSlot,
//   SLOT_ICONS,
//   SLOT_LABELS,
// } from '../../../core/models/build-state.model';
// import { ScoredComposant } from '../../../core/models/recommendation.model';

// @Component({
//   standalone: true,
//   selector: 'app-builder-shell',
//   imports: [CommonModule, CurrencyPipe],
//   templateUrl: './builder-shell.component.html',
// })
// export class BuilderShellComponent {
//   readonly state = inject(BuilderStateService);
//   readonly labels = SLOT_LABELS;
//   readonly icons = SLOT_ICONS;
//   readonly slots = BUILD_SLOT_ORDER;
//   readonly build = this.state.build;
//   readonly active = this.state.activeSlot;

//   open(slot: BuildSlot, event: Event) {
//     event.stopPropagation();
//     this.state.openSlotPicker(slot);
//   }

//   remove(slot: BuildSlot, event: Event) {
//     event.stopPropagation();
//     this.state.removeComponent(slot);
//   }

//   pick(scored: ScoredComponent) {
//     const slot = this.active();
//     if (slot) this.state.selectComponent(slot, scored.component);
//   }

//   close() {
//     this.state.closeSlotPicker();
//   }
//   reset() {
//     this.state.resetBuild();
//   }

//   scoreColor(score: number): string {
//     if (score >= 80) return '#22c55e';
//     if (score >= 50) return '#f59e0b';
//     return '#ef4444';
//   }
// }
