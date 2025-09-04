import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { LoggerService } from '../logger/logger.service';
import { LoggerType } from '@common/types';

export abstract class BaseApiService {
  protected constructor(
    protected http: HttpClient,
    private baseUrl: string,
  ) {}

  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`).pipe(catchError(this.handleError));
  }

  protected post<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  protected delete<T>(endpoint: string) {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`).pipe(catchError(this.handleError));
  }

  protected patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  protected handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occured.';
    if (error.error instanceof ErrorEvent) {
      //Client-side or network error
      errorMessage = `Network error: ${error.message}`;
    } else {
      //Backend returned unsuccessful response code
      errorMessage = `Backend returned code ${error.status}: ${error.message} => ${error.error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
