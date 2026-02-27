import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Expense, ExpenseCategory, ExpenseSummary } from '../models/Expense.model';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/expenses`;

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  createExpense(expense: Expense): Observable<Expense> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(this.baseUrl, expense, { headers }).pipe(
      map(response => response.data)
    );
  }

  getExpenses(page: number = 0, size: number = 10): Observable<any> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('pharmacyId', this.getPharmacyId())
      .set('page', page)
      .set('size', size);

    return this.http.get<any>(this.baseUrl, { headers, params }).pipe(
      map(response => response.data)
    );
  }

  getExpenseById(id: number): Observable<Expense> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('pharmacyId', this.getPharmacyId());
    return this.http.get<any>(`${this.baseUrl}/${id}`, { headers, params }).pipe(
      map(response => response.data)
    );
  }

  updateExpense(id: number, expense: Expense): Observable<Expense> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('pharmacyId', this.getPharmacyId());
    return this.http.put<any>(`${this.baseUrl}/${id}`, expense, { headers, params }).pipe(
      map(response => response.data)
    );
  }

  deleteExpense(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('pharmacyId', this.getPharmacyId());
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers, params });
  }

  getExpenseSummary(startDate?: string, endDate?: string): Observable<ExpenseSummary> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams().set('pharmacyId', this.getPharmacyId());

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(`${this.baseUrl}/summary`, { headers, params }).pipe(
      map(response => response.data)
    );
  }

  getExpenseCategories(): { value: ExpenseCategory; label: string; labelAr: string }[] {
    return [
      { value: 'PURCHASES', label: 'Purchases', labelAr: 'المشتريات' },
      { value: 'SALARIES', label: 'Salaries', labelAr: 'الرواتب' },
      { value: 'RENT', label: 'Rent', labelAr: 'الإيجار' },
      { value: 'UTILITIES', label: 'Utilities', labelAr: 'المرافق' },
      { value: 'MAINTENANCE', label: 'Maintenance', labelAr: 'الصيانة' },
      { value: 'MARKETING', label: 'Marketing', labelAr: 'التسويق' },
      { value: 'INSURANCE', label: 'Insurance', labelAr: 'التأمين' },
      { value: 'LICENSES', label: 'Licenses', labelAr: 'التراخيص' },
      { value: 'TRANSPORT', label: 'Transport', labelAr: 'النقل' },
      { value: 'OTHER', label: 'Other', labelAr: 'أخرى' }
    ];
  }

  getPaymentMethods(): { value: string; label: string; labelAr: string }[] {
    return [
      { value: 'CASH', label: 'Cash', labelAr: 'نقدي' },
      { value: 'VISA', label: 'Credit Card', labelAr: 'بطاقة ائتمان' },
      { value: 'INSTAPAY', label: 'InstaPay', labelAr: 'إنستا باي' },
      { value: 'BANK_TRANSFER', label: 'Bank Transfer', labelAr: 'تحويل بنكي' },
      { value: 'WALLET', label: 'E-Wallet', labelAr: 'محفظة إلكترونية' }
    ];
  }
}
