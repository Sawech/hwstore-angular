import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mon-compte.component.html',
})
export class MonCompteComponent {
  authService = inject(AuthService);

  get user() {
    return this.authService.currentUser();
  }
}
