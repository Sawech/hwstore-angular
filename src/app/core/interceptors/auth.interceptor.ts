import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdminAuthService } from '../../admin/core/admin-auth.service';
import { AppConfig } from '../config/app-config';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const adminAuthService = inject(AdminAuthService);

  let headers = req.headers.set('ngrok-skip-browser-warning', 'true');

  if (req.url.includes('/admin/')) {
    const token = adminAuthService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return next(req.clone({ headers }));
  }

  if (req.url.startsWith(environment.apiUrl)) {
    const token = localStorage.getItem('hwstore_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return next(req.clone({ headers }));
};
