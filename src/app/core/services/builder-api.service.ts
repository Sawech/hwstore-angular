/**
 * HWstore — Builder API Service
 * Handles all HTTP communication with the NestJS builder endpoints.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecommendationResponse, CompatibilityResult } from '../models/recommendation.model';
import { BuildState } from '../models/build-state.model';
import { Composant, ComposantType } from '../models/recommendation.model';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class BuilderApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/builder`;

  /** POST /builder/recommendations */
  getRecommendations(
    targetType: ComposantType,
    build: BuildState,
    limit = 20,
    offset = 0,
  ): Observable<RecommendationResponse> {
    return this.http.post<RecommendationResponse>(`${this.base}/recommendations`, {
      ...this.serializeBuild(build),
      targetType,
      limit,
      offset,
    });
  }

  /** POST /builder/validate */
  validateBuild(build: BuildState): Observable<CompatibilityResult> {
    return this.http.post<CompatibilityResult>(`${this.base}/validate`, this.serializeBuild(build));
  }

  /** GET /builder/compatible-composants */
  getCompatible(
    targetType: ComposantType,
    build: BuildState,
    limit = 20,
    offset = 0,
  ): Observable<RecommendationResponse> {
    const params = {
      targetType,
      ...this.serializeBuild(build),
      limit: String(limit),
      offset: String(offset),
    };
    return this.http.get<RecommendationResponse>(`${this.base}/compatible-composants`, {
      params: params as any,
    });
  }

  private serializeBuild(build: BuildState): Record<string, number> {
    return {
      ...(build.motherboard && { motherboardId: build.motherboard.id }),
      ...(build.cpu && { cpuId: build.cpu.id }),
      ...(build.gpu && { gpuId: build.gpu.id }),
      ...(build.ram && { ramId: build.ram.id }),
      ...(build.psu && { psuId: build.psu.id }),
      ...(build.case && { caseId: build.case.id }),
      ...(build.cooler && { coolerId: build.cooler.id }),
      ...(build.storage && { storageId: build.storage.id }),
    };
  }
}
