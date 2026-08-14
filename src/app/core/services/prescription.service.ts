import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models';
import { environment } from '../../../environments/environment';

export interface PrescriptionUploadResult {
  url: string;
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/sales/prescriptions`;

  upload(file: File): Observable<PrescriptionUploadResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': token ? `Bearer ${token}` : '' });

    return this.http.post<ApiResponse<PrescriptionUploadResult>>(
      `${this.apiUrl}/upload`, formData, { headers }
    ).pipe(map(response => response.data));
  }
}
