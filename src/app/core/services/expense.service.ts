import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';  // ✅ أضف HttpHeaders
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Expense {
  id?: number;
  pharmacyId: number;
  category: ExpenseCategory;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  paymentMethod?: string;
  referenceNumber?: string;
  attachmentUrl?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ExpenseCategory =
  | 'PURCHASES'
  | 'SALARIES'
  | 'RENT'
  | 'UTILITIES'
  | 'MAINTENANCE'
  | 'MARKETING'
  | 'INSURANCE'
  | 'LICENSES'
  | 'TRANSPORT'
  | 'OTHER';

export interface ExpenseSummary {
  totalExpenses: number;
  totalTransactions: number;
  averageExpense: number;
  expensesByCategory: Array<{
    category: string;
    amount: number;
  }>;
  dailyExpenses: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  recentExpenses: Array<{
    id: number;
    title: string;
    category: ExpenseCategory;
    amount: number;
    expenseDate: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/expenses';

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  // ✅ FIXED: Helper method to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ✅ Create Expense - FIXED: Added headers
  createExpense(expense: Expense): Observable<Expense> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(this.baseUrl, expense, { headers }).pipe(
      map(response => response.data)
    );
  }

  // ✅ Get All Expenses (Paginated) - FIXED: Added headers
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

  // ✅ Get Expense by ID - FIXED: Added headers
  getExpenseById(id: number): Observable<Expense> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('pharmacyId', this.getPharmacyId());
    return this.http.get<any>(`${this.baseUrl}/${id}`, { headers, params }).pipe(
      map(response => response.data)
    );
  }

  // ✅ Update Expense - FIXED: Added headers
  updateExpense(id: number, expense: Expense): Observable<Expense> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('pharmacyId', this.getPharmacyId());
    return this.http.put<any>(`${this.baseUrl}/${id}`, expense, { headers, params }).pipe(
      map(response => response.data)
    );
  }

  // ✅ Delete Expense - FIXED: Added headers
  deleteExpense(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('pharmacyId', this.getPharmacyId());
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers, params });
  }

  // ✅ Get Expense Summary (for Reports) - FIXED: Added headers
  getExpenseSummary(startDate?: string, endDate?: string): Observable<ExpenseSummary> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams().set('pharmacyId', this.getPharmacyId());

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(`${this.baseUrl}/summary`, { headers, params }).pipe(
      map(response => response.data)
    );
  }

  // ✅ Get Expense Categories (for dropdown) - No auth needed
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

  // ✅ Get Payment Methods (for dropdown) - No auth needed
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
