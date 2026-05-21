import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { HeaderComponent } from './shared/header/header';
import { FooterComponent } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    @if (!isAdminRoute() && !isClientLoginRoute()) {
      <app-header />
    }
    <main>
      <router-outlet />
    </main>
    @if (!isAdminRoute() && !isClientLoginRoute()) {
      <app-footer />
    }
  `,
  styles: [],
})
export class App {
  private router = inject(Router);

  private url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  isAdminRoute = computed(() => this.url().startsWith('/admin'));
  isClientLoginRoute = computed(() => this.url().startsWith('/login'));
}
