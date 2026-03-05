import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, BehaviorSubject, startWith, map } from 'rxjs';
import Swal from 'sweetalert2';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductService } from '../../../core/services/product.service';
import { SalesService } from '../../../core/services/sales.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Product } from '../../../core/models/product.model';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface SaleRequest {
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  discountAmount: number;
  paymentMethod: string;
  customerPhone: string;
  totalAmount: number;
}

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MaterialModule, PageHeaderComponent],
  templateUrl: './sales-form.component.html',
  styleUrl: './sales-form.component.scss'
})
export class SalesFormComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly salesService = inject(SalesService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly displayedColumns = ['product', 'quantity', 'price', 'total', 'actions'];
  readonly cartItems = signal<CartItem[]>([]);
  readonly productControl = new FormControl();
  readonly products = signal<Product[]>([]);
  readonly customerPhone = signal('');
  readonly paymentMethod = signal('CASH');
  readonly discount = signal(0);
  readonly loading = signal(false);

  private readonly allProducts = signal<Product[]>([]);
  private readonly filteredProductsSubject = new BehaviorSubject<Product[]>([]);
  readonly currentFilteredProducts$ = this.filteredProductsSubject.asObservable();

  readonly filteredProducts: Observable<Product[]> = this.productControl.valueChanges.pipe(
    startWith(''),
    map(value => {
      const searchValue = typeof value === 'string' ? value : value?.name || '';
      const filtered = this._filterProducts(searchValue);
      this.filteredProductsSubject.next(filtered);
      return filtered;
    })
  );

  readonly subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.totalPrice, 0)
  );

  readonly totalAmount = computed(() =>
    Math.max(0, this.subtotal() - this.discount())
  );

  readonly isCartEmpty = computed(() => this.cartItems().length === 0);
  readonly isSubmitDisabled = computed(() =>
    this.loading() || this.isCartEmpty() || this.totalAmount() <= 0
  );

  ngOnInit(): void {
    this.loadProducts();
    this.filteredProductsSubject.next(this.allProducts().slice(0, 10));
  }

  private _filterProducts(value: string): Product[] {
    if (!value) return this.allProducts().slice(0, 10);
    const filterValue = value.toLowerCase();
    return this.allProducts()
      .filter(p =>
        p.name.toLowerCase().includes(filterValue) ||
        p.barcode?.toLowerCase().includes(filterValue)
      )
      .slice(0, 10);
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        const data = (response.data || []).map((p: Product) => ({
          ...p,
          sellPrice: p.sellPrice || 0
        }));
        this.allProducts.set(data);
        this.products.set(data);
        this.filteredProductsSubject.next(data.slice(0, 10));
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'PRODUCTS.LOAD_ERROR')
    });
  }

  displayProduct(product: Product): string {
    return product?.name || '';
  }

  onProductSelected(product: Product): void {
    if (!product) return;
    this.addProductToCart(product);
    setTimeout(() => this.productControl.setValue(''), 100);
  }

  onAddFirstProduct(): void {
    const filtered = this.filteredProductsSubject.getValue();
    if (filtered?.length > 0) this.onProductSelected(filtered[0]);
  }

  isAddButtonDisabled(): boolean {
    return !this.filteredProductsSubject.getValue()?.length;
  }

  addProductToCart(product: Product): void {
    if (product.totalStock <= 0) {
      this.errorHandler.showWarning('SALES.INSUFFICIENT_STOCK');
      return;
    }

    const unitPrice = product.sellPrice || 0;
    if (unitPrice === 0) {
      this.errorHandler.showWarning('SALES.NO_PRICE', { params: { name: product.name } });
      return;
    }

    const currentItems = this.cartItems();
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.totalStock) {
        this.errorHandler.showWarning('SALES.QUANTITY_EXCEEDED');
        return;
      }
      this.cartItems.set(currentItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      this.cartItems.set([...currentItems, {
        product,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice
      }]);
    }
  }

  removeFromCart(index: number): void {
    this.cartItems.set(this.cartItems().filter((_, i) => i !== index));
  }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(this.cartItems().indexOf(item));
      return;
    }
    if (quantity > item.product.totalStock) {
      this.errorHandler.showWarning('SALES.QUANTITY_EXCEEDED');
      return;
    }
    this.cartItems.set(this.cartItems().map(cartItem =>
      cartItem.product.id === item.product.id
        ? { ...cartItem, quantity, totalPrice: quantity * cartItem.unitPrice }
        : cartItem
    ));
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.discount.set(0);
    this.customerPhone.set('');
    this.productControl.setValue('');
  }

  onSubmit(): void {
    if (!this.validateSale()) return;

    this.loading.set(true);
    const saleRequest = this.mapCartToSaleRequest();
    this.salesService.createSale(saleRequest).subscribe({
      next: (response) => this.handleSaleSuccess(response),
      error: (error) => this.errorHandler.handleHttpError(error, 'SALES.CREATE_ERROR')
    });
  }

  /** 1. Validation Logic **/
  private validateSale(): boolean {
    if (this.isCartEmpty()) {
      this.errorHandler.showWarning('SALES.EMPTY_CART');
      return false;
    }
    if (this.totalAmount() <= 0) {
      this.errorHandler.showWarning('SALES.INVALID_TOTAL');
      return false;
    }
    return true;
  }

  /** 2. Data Mapping Logic **/
  private mapCartToSaleRequest(): SaleRequest {
    return {
      items: this.cartItems().map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      discountAmount: this.discount(),
      paymentMethod: this.paymentMethod(),
      customerPhone: this.customerPhone(),
      totalAmount: this.subtotal()
    };
  }

  /** 3. Success Handling & UI **/
  private handleSaleSuccess(response: any): void {
    this.loading.set(false);

    const invoiceNumber = response.invoiceNumber || response.data?.invoiceNumber || 'N/A';
    const totalAmount = response.totalAmount || this.totalAmount();

    Swal.fire({
      icon: 'success',
      title: this.translate.instant('SALES.SUCCESS_TITLE'),
      html: this.getSuccessAlertHtml(invoiceNumber, totalAmount),
      showConfirmButton: true,
      confirmButtonText: this.translate.instant('COMMON.CONTINUE'),
      confirmButtonColor: '#667eea',
      timer: 10000,
      timerProgressBar: true,
      didOpen: () => this.setupCopyFunction(),
      willClose: () => { delete (window as any).copyInvoiceNumber; }
    }).then((result) => {
      this.finalizeSale();
    });
  }

  /** 4. Helper for HTML Template **/
  private getSuccessAlertHtml(invoiceNumber: string, totalAmount: number): string {
    return `
    <div style="text-align: center; padding: 10px;">
      <div style="margin-bottom: 15px;">
        <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
          ${this.translate.instant('SALES.INVOICE_NUMBER')}:
        </p>
        <div style="display: inline-flex; align-items: center; gap: 10px; background: #f8f9fa; padding: 10px 20px; border-radius: 8px; border: 2px solid #667eea;">
          <strong style="color: #667eea; font-size: 20px; font-family: monospace;">${invoiceNumber}</strong>
          <button id="copyInvoiceBtn" onclick="copyInvoiceNumber('${invoiceNumber}')"
                  style="background: #667eea; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 1.5a.5.5 0 0 1 .5.5v1h6v-1a.5.5 0 0 1 1 0v1h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1v-1a.5.5 0 0 1 .5-.5z"/>
            </svg>
          </button>
        </div>
        <p id="copyMessage" style="font-size: 12px; color: #10b981; margin-top: 8px; opacity: 0; transition: opacity 0.3s;"></p>
      </div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9ecef;">
        <p style="font-size: 14px; color: #666; margin-bottom: 5px;">
          ${this.translate.instant('SALES.TOTAL_AMOUNT')}:
        </p>
        <strong style="color: #10b981; font-size: 22px;">${this.formatCurrency(totalAmount)}</strong>
      </div>
    </div>`;
  }

  private setupCopyFunction(): void {
    (window as any).copyInvoiceNumber = (number: string) => {
      navigator.clipboard.writeText(number).then(() => {
        const messageEl = document.getElementById('copyMessage');
        const btnEl = document.getElementById('copyInvoiceBtn');
        if (messageEl && btnEl) {
          messageEl.textContent = '✅ تم النسخ بنجاح!';
          messageEl.style.opacity = '1';
          btnEl.style.background = '#10b981';
          setTimeout(() => {
            messageEl.style.opacity = '0';
            btnEl.style.background = '#667eea';
          }, 2000);
        }
      });
    };
  }

  private handleSaleError(error: any): void {
    this.loading.set(false);
    this.errorHandler.handleHttpError(error, 'SALES.CREATE_ERROR');
  }

  private finalizeSale(): void {
    this.clearCart();
    this.router.navigate(['/sales/history']);
  }

  onCancel(): void {
    if (!this.isCartEmpty()) {
      Swal.fire({
        title: this.translate.instant('COMMON.CONFIRM'),
        text: this.translate.instant('SALES.CANCEL_CONFIRM'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: this.translate.instant('COMMON.YES'),
        cancelButtonText: this.translate.instant('COMMON.CANCEL')
      }).then((result) => {
        if (result.isConfirmed) this.clearCart();
      });
    }
  }

  formatCurrency(amount: number): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getCurrencySuffix(): string {
    return this.languageService.getCurrentLanguage() === 'ar' ? 'ج.م' : 'EGP';
  }

  getPaymentMethodLabel(method: string): string {
    return this.translate.instant(`COMMON.PAYMENT_METHODS.${method}`);
  }

  getStockLabel(stock: number): string {
    return this.translate.instant('SALES.AVAILABLE', { count: stock });
  }
}
