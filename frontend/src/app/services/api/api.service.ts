import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError, Observable, filter, switchMap, take } from 'rxjs';
import { AuthTokenService } from '../authtoken/authtoken.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  //DEV BASE_URL
  private readonly BASE_URL: string = "http://localhost:3000/api";

  constructor(private http: HttpClient, private tokenService: AuthTokenService) { }


  public publicPost<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.BASE_URL}/${endpoint}`, body)
    .pipe(catchError(this.handleError));
  }

  private authFetch<T>(fetchFn: (token: string) => Observable<T>): Observable<T> {
    return this.tokenService.token$.pipe(
      filter((token): token is string => !!token),
      take(1),
      switchMap(token => fetchFn(token))
    )
  }

  public get<T>(endpoint: string): Observable<T> {
    // return this.tokenService.token$.pipe(
    //   filter((token): token is string => !!token),
    //   take(1),
    //   switchMap(token => {
    //     const headers = this.buildHeaders(token);
    //     return this.http.get<T>(`${this.BASE_URL}/${endpoint}`, { headers });
    //   }),
    //   catchError(this.handleError)
    // )
    // return this.http.get<T>(`${this.BASE_URL}/${endpoint}`)
    // .pipe(catchError(this.handleError));

    return this.authFetch<T>(_ => this.http.get<T>(`${this.BASE_URL}/${endpoint}`)
    .pipe(catchError(this.handleError))); 
  }

  public post<T>(endpoint: string, body: any): Observable<T> {
    // return this.http.post<T>(`${this.BASE_URL}/${endpoint}`, body, { headers: this.getAuthHeaders() })
    // .pipe(catchError(this.handleError));
    // return this.tokenService.token$.pipe(
    //   filter((token): token is string => !!token),
    //   take(1),
    //   switchMap(token => {
    //     const headers = this.buildHeaders(token);
    //     return this.http.post<T>(`${this.BASE_URL}/${endpoint}`, body, { headers });
    //   }),
    //   catchError(this.handleError)
    // )
    // return this.http.post<T>(`${this.BASE_URL}/${endpoint}`, body)
    // .pipe(catchError(this.handleError));

    return this.authFetch<T>(_ => this.http.post<T>(`${this.BASE_URL}/${endpoint}`, body)
    .pipe(catchError(this.handleError)));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API error:', error);

    let errorMessage = 'An unknown error occured.';
    if (error.error instanceof ErrorEvent) {
      //Client-side or network error
      errorMessage = `Network error: ${error.message}`;
    } else {
      //Backend returned unsuccessful response code
      errorMessage = `Backend returned code ${error.status}: ${error.message}`
    }

    return throwError(() => new Error(errorMessage));
  }
}
