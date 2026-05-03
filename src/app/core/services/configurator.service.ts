/**
 * HWstore — Configurator Service
 */

import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { AppConfig } from '../config/app-config';
import {
  BuildState,
  BuildStep,
  CalculateBuildRequest,
  CalculateBuildResponse,
  ComponentType,
  ConfiguratorComponent,
} from '../models/product.model';

export const BUILD_STEPS: BuildStep[] = [
  { key: 'boitier', label: 'Boîtier', icon: 'view_in_ar', stepNumber: '01' },
  { key: 'carte-mere', label: 'Carte Mère', icon: 'developer_board', stepNumber: '03' },
  { key: 'processeur', label: 'Processeur', icon: 'memory', stepNumber: '02' },
  { key: 'ram', label: 'Mémoire RAM', icon: 'memory_alt', stepNumber: '04' },
  { key: 'stockage', label: 'Stockage', icon: 'hard_drive', stepNumber: '05' },
  { key: 'gpu', label: 'Carte Graphique', icon: 'videogame_asset', stepNumber: '06' },
  { key: 'alimentation', label: 'Alimentation', icon: 'power', stepNumber: '07' },
  { key: 'refroidissement', label: 'Refroidissement', icon: 'ac_unit', stepNumber: '08' },
];

@Injectable({ providedIn: 'root' })
export class ConfiguratorService {
  private http = inject(HttpClient);

  private _currentStep = signal<ComponentType>('boitier');
  private _build = signal<BuildState>({});

  readonly currentStep = this._currentStep.asReadonly();
  readonly build = this._build.asReadonly();

  readonly total = computed(() =>
    Object.values(this._build()).reduce((sum, comp) => sum + (comp?.price ?? 0), 0),
  );

  readonly estimatedWattage = computed(() =>
    Object.values(this._build()).reduce((sum, comp) => sum + (comp?.wattage ?? 0), 0),
  );

  readonly completedSteps = computed(() => {
    const build = this._build();
    return BUILD_STEPS.filter((step) => {
      const key = step.key as keyof BuildState;
      return !!build[key];
    }).map((s) => s.key);
  });

  setStep(step: ComponentType): void {
    this._currentStep.set(step);
  }

  goToNextStep(): void {
    const idx = BUILD_STEPS.findIndex((s) => s.key === this._currentStep());
    if (idx < BUILD_STEPS.length - 1) {
      this._currentStep.set(BUILD_STEPS[idx + 1].key);
    }
  }

  selectComponent(component: ConfiguratorComponent): void {
    this._build.update((build) => ({
      ...build,
      [component.type]: component,
    }));
  }

  removeComponent(type: ComponentType): void {
    this._build.update((build) => {
      const newBuild = { ...build };
      delete newBuild[type as keyof BuildState];
      return newBuild;
    });
  }

  resetBuild(): void {
    this._build.set({});
    this._currentStep.set('boitier');
  }

  getComponentsForStep(type: ComponentType): ConfiguratorComponent[] {
    return [];
  }

  isSelected(component: ConfiguratorComponent): boolean {
    const build = this._build();
    const selected = build[component.type as keyof BuildState];
    return selected?.id === component.id;
  }

  calculateBuild(): Observable<CalculateBuildResponse> {
    const build = this._build();
    const request: CalculateBuildRequest = {
      boitierId: build.boitier?.id,
      processeurId: build.processeur?.id,
      cartemereId: build['carte-mere']?.id,
      ramId: build.ram?.id,
      stockageId: build.stockage?.id,
      gpuId: build.gpu?.id,
      alimentationId: build.alimentation?.id,
      refroidissementId: build.refroidissement?.id,
    };

    return this.http
      .post<CalculateBuildResponse>(`${AppConfig.apiUrl}/configurator/calculate`, request)
      .pipe(
        catchError(() =>
          of({
            total: this.total(),
            components: Object.values(build).filter(Boolean) as ConfiguratorComponent[],
            estimatedWattage: this.estimatedWattage(),
            compatibilityScore: 100,
          }),
        ),
      );
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-DZ').format(price) + ' DA';
  }
}
