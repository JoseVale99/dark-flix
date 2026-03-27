import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { ProgressBarService } from '../services/progress-bar';

export const progressInterceptor: HttpInterceptorFn = (req, next) => {
  const progressSvc = inject(ProgressBarService);

  // Solo activar para requests a la WP REST API
  if (!req.url.includes('wp-json')) return next(req);

  progressSvc.start();
  return next(req).pipe(finalize(() => progressSvc.complete()));
};
