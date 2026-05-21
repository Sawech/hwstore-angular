/**
 * HWstore — Builder Domain Models (Angular)
 */

export type ComposantType =
  | 'boitier'
  | 'processeur'
  | 'carte-mere'
  | 'ram'
  | 'stockage'
  | 'gpu'
  | 'alimentation'
  | 'refroidissement';

export interface Composant {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  images: string[];
  type: ComposantType;
  specs: Record<string, string | number | string[]>;
  stock: number;
  slug: string;
}

export interface ScoreBreakdown {
  socketMatch?: number;
  ramTypeMatch?: number;
  powerFit?: number;
  physicalFit?: number;
  futureProofing?: number;
  // pricePerformance?: number;
  efficiency?: number;
  // vramValue?: number;
  pcieVersion?: number;
}

export interface ScoredComposant {
  composant: Composant;
  compatibilityScore: number;
  recommendationScore: number;
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  isCompatible: boolean;
  incompatibilityReasons: string[];
}

export interface RecommendationResponse {
  targetType: ComposantType;
  buildContext: string[];
  results: ScoredComposant[];
  totalCandidates: number;
  compatibleCount: number;
}

export type CompatibilitySeverity = 'error' | 'warning' | 'ok';

export interface CompatibilityIssue {
  severity: CompatibilitySeverity;
  rule: string;
  message: string;
  affectedSlots: string[];
}

export interface CompatibilityResult {
  isCompatible: boolean;
  score: number;
  issues: CompatibilityIssue[];
}
