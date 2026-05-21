/**
 * HWstore — Builder State Service
 * Reactive signal-based store. Auto-validates on every build change.
 */
import { Injectable, computed, signal, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, tap, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { BuildState, BuildSlot, BUILD_SLOT_ORDER, SLOT_TO_TYPE } from '../models/build-state.model';
import {
  Composant,
  ComposantType,
  RecommendationResponse,
  CompatibilityResult,
} from '../models/recommendation.model';
import { BuilderApiService } from './builder-api.service';

@Injectable({ providedIn: 'root' })
export class BuilderStateService {
  private readonly api = inject(BuilderApiService);

  // ── Core signals ────────────────────────────────────────────────
  readonly build = signal<BuildState>({});
  readonly activeSlot = signal<BuildSlot | null>(null);
  readonly isValidating = signal(false);
  readonly isLoading = signal(false);

  // ── Derived / computed ──────────────────────────────────────────
  readonly filledSlots = computed(() =>
    Object.entries(this.build())
      .filter(([, v]) => !!v)
      .map(([k]) => k as BuildSlot),
  );

  readonly totalPrice = computed(() =>
    Object.values(this.build())
      .filter(Boolean)
      .reduce((sum, c) => sum + Number(c!.price), 0),
  );

  readonly estimatedWattage = computed(() => {
    const b = this.build();
    let w = 100; // baseline: mobo + fans + storage
    if (b.cpu) w += Number((b.cpu.specs as any)['tdp'] ?? 0);
    if (b.gpu) {
      const g = b.gpu.specs as any;
      w += Number(g['tdp'] ?? Math.round(Number(g['recommendedPsu'] ?? 0) * 0.75));
    }
    return w;
  });

  readonly isEmpty = computed(() => this.filledSlots().length === 0);

  // ── Server-driven state ─────────────────────────────────────────
  readonly compatibilityResult = signal<CompatibilityResult | null>(null);
  readonly recommendations = signal<RecommendationResponse | null>(null);

  constructor() {
    // Auto-validate whenever the build changes (debounced 400ms)
    toObservable(this.build)
      .pipe(
        debounceTime(400),
        tap(() => this.isValidating.set(true)),
        switchMap((build) => this.api.validateBuild(build).pipe(catchError(() => EMPTY))),
      )
      .subscribe((result) => {
        this.compatibilityResult.set(result);
        this.isValidating.set(false);
      });
  }

  // ── Public actions ──────────────────────────────────────────────

  selectComposant(slot: BuildSlot, composant: Composant): void {
    this.build.update((b) => ({ ...b, [slot]: composant }));
    this.recommendations.set(null);

    const next = this.nextEmptySlot(slot);
    if (next) {
      this.openSlotPicker(next);
    } else {
      this.activeSlot.set(null);
    }
  }

  private nextEmptySlot(justFilled: BuildSlot): BuildSlot | null {
    const build = this.build();
    return BUILD_SLOT_ORDER.find((slot) => slot !== justFilled && !build[slot]) ?? null;
  }

  removeComposant(slot: BuildSlot): void {
    this.build.update((b) => {
      const next = { ...b };
      delete next[slot];
      return next;
    });
  }

  openSlotPicker(slot: BuildSlot): void {
    this.activeSlot.set(slot);
    this._loadRecommendations(slot);
  }

  closeSlotPicker(): void {
    this.activeSlot.set(null);
    this.recommendations.set(null);
  }

  loadMoreRecommendations(offset: number): void {
    const slot = this.activeSlot();
    if (slot) this._loadRecommendations(slot, offset);
  }

  resetBuild(): void {
    this.build.set({});
    this.compatibilityResult.set(null);
    this.recommendations.set(null);
    this.activeSlot.set(null);
  }

  private _loadRecommendations(slot: BuildSlot, offset = 0): void {
    const type = SLOT_TO_TYPE[slot];
    this.isLoading.set(true);
    this.api
      .getRecommendations(type, this.build(), 20, offset)
      .pipe(
        tap(() => this.isLoading.set(false)),
        catchError(() => {
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((res) => this.recommendations.set(res));
  }
}
