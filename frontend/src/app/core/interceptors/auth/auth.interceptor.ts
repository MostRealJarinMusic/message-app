import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenService } from '../../services/auth-token/auth-token.service';
import { BehaviorSubject, catchError, filter, from, switchMap, take, throwError } from 'rxjs';
import { Token } from '@common/types';
import { AuthService } from '../../services/auth/auth.service';

let isRefreshing = false;
let tokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next) => {
  const tokenService = inject(AuthTokenService);
  const authService = inject(AuthService);
  const token = tokenService.getToken();

  const modifyRequest = (req: HttpRequest<any>, token: Token | null) => {
    let headers = req.headers;
    const isPrivate = req.url.includes('private');

    if (token && isPrivate) headers = headers.set('Authorization', `Bearer ${token}`);

    const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);
    if (hasBody && !headers.has('Content-Type')) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return req.clone({ headers });
  };

  const modifiedReq = modifyRequest(req, token);

  return next(modifiedReq).pipe(
    catchError((err) => {
      // console.log(err);
      if (err.status === 401 && err.error.message === 'Expired token') {
        if (!isRefreshing) {
          isRefreshing = true;

          tokenSubject.next(null);

          return from(authService.refresh()).pipe(
            switchMap((success) => {
              isRefreshing = false;
              const newToken = tokenService.getToken();

              if (success && newToken) {
                tokenService.setToken(newToken);
                tokenSubject.next(newToken);

                return next(modifyRequest(req, newToken));
              } else {
                return throwError(() => err);
              }
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              tokenService.clearToken();

              //Bad refresh token - attempt to logout
              return throwError(() => refreshErr);
            }),
          );
        } else {
          return tokenSubject.pipe(
            filter((t) => t !== null),
            take(1),
            switchMap((newToken) => next(modifyRequest(req, newToken))),
          );
        }
      }

      return throwError(() => err);
    }),
  );
};
