import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'admin-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styles: [
    `
      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.25s ease-out;
      }
    `,
  ],
})
export class AdminToastComponent {
  toastService = inject(ToastService);
}
