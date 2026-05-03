/**
 * HWstore — PC Configurator Page
 */

import { Component, computed, inject } from '@angular/core';
import { BUILD_STEPS, ConfiguratorService } from '../../core/services/configurator.service';
import { CartService } from '../../core/services/cart.service';
import { ConfiguratorComponent, ComponentType } from '../../core/models/product.model';

@Component({
  selector: 'app-configurateur',
  standalone: true,
  imports: [],
  templateUrl: './configurateur.component.html',
})
export class ConfigurateurComponent {
  configuratorService = inject(ConfiguratorService);
  private cartService = inject(CartService);

  readonly steps = BUILD_STEPS;

  currentComponents = computed(() =>
    this.configuratorService.getComponentsForStep(this.configuratorService.currentStep()),
  );

  powerPercent = computed(() => {
    const wattage = this.configuratorService.estimatedWattage();
    return Math.min(Math.round((wattage / 850) * 100), 100);
  });

  currentStepInfo = computed(() =>
    this.steps.find((s) => s.key === this.configuratorService.currentStep()),
  );

  setStep(key: ComponentType): void {
    this.configuratorService.setStep(key);
  }

  selectComponent(component: ConfiguratorComponent): void {
    this.configuratorService.selectComponent(component);
    this.configuratorService.goToNextStep();
  }

  isStepCompleted(key: ComponentType): boolean {
    return this.configuratorService.completedSteps().includes(key);
  }

  isComponentSelected(component: ConfiguratorComponent): boolean {
    return this.configuratorService.isSelected(component);
  }

  getSelectedForStep(key: ComponentType) {
    const build = this.configuratorService.build();
    return build[key as keyof typeof build];
  }

  addBuildToCart(): void {
    const total = this.configuratorService.total();
    const build = this.configuratorService.build();
    const components = Object.values(build).filter(Boolean) as ConfiguratorComponent[];
    if (components.length === 0) return;

    const firstComponent = components[0];
    this.cartService.addToCart(
      {
        id: `build-${Date.now()}`,
        name: 'PC Configuré sur mesure',
        slug: 'pc-configure',
        brand: 'HWstore Build',
        subCategory: 1,
        price: total,
        rating: 5,
        images: [firstComponent.image],
        tags: {},
        specs: {},
      },
      1,
    );
    this.configuratorService.resetBuild();
  }

  resetBuild(): void {
    this.configuratorService.resetBuild();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-DZ').format(price) + ' DA';
  }
}
