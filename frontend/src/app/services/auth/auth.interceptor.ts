import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { AuthTokenService } from '../authtoken/auth-token.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next
) => {
  const token = inject(AuthTokenService).getToken();
  const isPrivate = req.url.includes('private');

  let headers = req.headers;

  if (token && isPrivate) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);
  if (hasBody && !headers.has('Content-Type')) {
    headers = headers.set('Content-Type', 'application/json');
  }

  const modifiedReq = req.clone({ headers });

  return next(modifiedReq);
};
