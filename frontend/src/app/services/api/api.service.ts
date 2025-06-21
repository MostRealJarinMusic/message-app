import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  //DEV BASE_URL
  private readonly BASE_URL: string = "http://localhost:3000/api";

  constructor(private http: HttpClient) { }

  public get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.BASE_URL}/${endpoint}`, { headers: this.getAuthHeaders() })
    .pipe(catchError(this.handleError));
  }

  public post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.BASE_URL}/${endpoint}`, body, { headers: this.getAuthHeaders() })
    .pipe(catchError(this.handleError));
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API error:', error);

    return throwError(() => new Error("Temporary message"))
  }
}
