import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { ApiResponse } from '../../models';

export interface Backup {
  id: number;
  backupName: string;
  filePath: string;
  fileSize: number;
  backupType: string;
  status: string;
  description: string;
  createdAt: string;
  restoredAt?: string;
}

export interface CreateBackupRequest {
  backupName: string;
  backupType: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/settings/backup';

  private getUserId(): number {
    const user = this.authService.getCurrentUser();
    return user?.userId || 1;
  }

  getBackups(): Observable<Backup[]> {
    return this.http.get<ApiResponse<Backup[]>>(this.apiUrl).pipe(
      map(response => response.data),
      catchError(this.handleError<Backup[]>('getBackups', []))
    );
  }

  createBackup(request: CreateBackupRequest): Observable<Backup> {
    const userId = this.getUserId();

    return this.http.post<ApiResponse<Backup>>(this.apiUrl, request, {
      params: new HttpParams().set('userId', userId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<Backup>('createBackup'))
    );
  }

  restoreBackup(id: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${id}/restore`, null).pipe(
      map(response => response.data),
      catchError(this.handleError<void>('restoreBackup'))
    );
  }

  deleteBackup(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data),
      catchError(this.handleError<void>('deleteBackup'))
    );
  }

  downloadBackup(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError<Blob>('downloadBackup', new Blob()))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
