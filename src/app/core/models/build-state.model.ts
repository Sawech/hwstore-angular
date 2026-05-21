/**
 * HWstore — Build State Model (Angular)
 */
import { Type } from '@angular/core';
import { Composant, ComposantType } from './client.model';
import { CpuIconComponent } from '../../shared/icons/cpu-icon';
import { MotherBoardIconComponent } from '../../shared/icons/motherboard-icon';
import { GpuIconComponent } from '../../shared/icons/gpu-icon';
import { RamIconComponent } from '../../shared/icons/ram-icon';
import { CoolerIconComponent } from '../../shared/icons/cooler-icon';
import { BoitierIconComponent } from '../../shared/icons/boitier-icon';
import { StorageIconComponent } from '../../shared/icons/storage-icon';
import { AlimentationIconComponent } from '../../shared/icons/alimentation-icon';

export interface BuildState {
  motherboard?: Composant;
  cpu?: Composant;
  gpu?: Composant;
  ram?: Composant;
  psu?: Composant;
  case?: Composant;
  cooler?: Composant;
  storage?: Composant;
}

export type BuildSlot = keyof BuildState;

export const SLOT_TO_TYPE: Record<BuildSlot, ComposantType> = {
  motherboard: 'carte-mere',
  cpu: 'processeur',
  gpu: 'gpu',
  ram: 'ram',
  psu: 'alimentation',
  case: 'boitier',
  cooler: 'refroidissement',
  storage: 'stockage',
};

export const SLOT_LABELS: Record<BuildSlot, string> = {
  motherboard: 'Carte Mère',
  cpu: 'Processeur',
  gpu: 'Carte Graphique',
  ram: 'Mémoire RAM',
  psu: 'Alimentation',
  case: 'Boîtier',
  cooler: 'Refroidissement',
  storage: 'Stockage',
};

export const SLOT_ICONS: Record<BuildSlot, Type<any>> = {
  motherboard: MotherBoardIconComponent,
  cpu: CpuIconComponent,
  gpu: GpuIconComponent,
  ram: RamIconComponent,
  psu: AlimentationIconComponent,
  case: BoitierIconComponent,
  cooler: CoolerIconComponent,
  storage: StorageIconComponent,
};

export const BUILD_SLOT_ORDER: BuildSlot[] = [
  'motherboard',
  'cpu',
  'ram',
  'gpu',
  'psu',
  'case',
  'cooler',
  'storage',
];
