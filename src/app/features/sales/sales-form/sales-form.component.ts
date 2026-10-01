import { Component, inject, signal, computed, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, firstValueFrom, startWith } from 'rxjs';
import Swal from 'sweetalert2';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductService } from '../../../core/services/product.service';
import { SalesService } from '../../../core/services/sales.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { SaleRequest } from '../../../core/models';
import { PaymentMethod, PaymentRequest, PaymentResponse } from '../../../core/models/payment.model';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { PharmacySettingsService } from '../../../core/services/settings/pharmacy-settings.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { SmartFeatureSettingsService } from '../../../core/services/settings/smart-feature-settings.service';
import { ETA_BUYER_ID_THRESHOLD, NATIONAL_ID_PATTERN } from '../../../core/models/einvoice.model';
import { OfflineSalesService, QueuedSale } from '../../../core/services/offline-sales.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductAlternativesDialogComponent, ProductAlternativesData } from './product-alternatives-dialog/product-alternatives-dialog.component';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MaterialModule, PageHeaderComponent, DatePipe],
  templateUrl: './sales-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sales-form.component.scss'
})
export class SalesFormComponent implements OnInit, AfterViewInit {
  private readonly productService = inject(ProductService);
  private readonly salesService = inject(SalesService);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly currencyService = inject(CurrencyService);
  private readonly pharmacySettingsService = inject(PharmacySettingsService);
  private readonly prescriptionService = inject(PrescriptionService);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly smartFeatureSettingsService = inject(SmartFeatureSettingsService);
  readonly offline = inject(OfflineSalesService);
  private readonly dialog = inject(MatDialog);
  // When the product list came from the device's saved copy (server unreachable).
  readonly catalogSavedAt = signal<string | null>(null);

  @ViewChild('barcodeInput') barcodeInputRef?: ElementRef<HTMLInputElement>;
  readonly barcodeValue = signal('');

  readonly voiceSearchSupported = signal(false);
  readonly isListening = signal(false);
  private speechRecognition: any = null;

  readonly displayedColumns = ['product', 'quantity', 'price', 'total', 'actions'];
  readonly cartItems = signal<CartItem[]>([]);
  readonly productControl = new FormControl();
  readonly products = signal<Product[]>([]);
  readonly customerPhone = signal('');
  readonly buyerNationalId = signal('');
  readonly buyerName = signal('');
  readonly paymentMethod = signal<PaymentMethod>(PaymentMethod.CASH);
  readonly discount = signal(0);
  readonly loading = signal(false);

  readonly prescriptionImageUrl = signal<string | null>(null);
  readonly prescriptionUploading = signal(false);

  private readonly allProducts = signal<Product[]>([]);

  // Products grouped by active ingredient: everything in a group is an
  // alternative for the rest. Built from the loaded list, so it works offline.
  private readonly productsByIngredient = computed(() => {
    const groups = new Map<string, Product[]>();
    for (const product of this.allProducts()) {
      if (!product.ingredientKey) continue;
      const group = groups.get(product.ingredientKey) ?? [];
      group.push(product);
      groups.set(product.ingredientKey, group);
    }
    return groups;
  });
  private readonly filteredProductsSubject = new BehaviorSubject<Product[]>([]);
  readonly currentFilteredProducts$ = this.filteredProductsSubject.asObservable();

  readonly subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.totalPrice, 0)
  );

  readonly totalAmount = computed(() =>
    Math.max(0, this.subtotal() - this.discount())
  );

  readonly isCartEmpty = computed(() => this.cartItems().length === 0);

  // ETA e-receipt: the buyer's national ID and name are required from the
  // threshold total - asked for here so the sale isn't refused at checkout.
  readonly eInvoiceEnabled = computed(() => this.smartFeatureSettingsService.flags().eInvoiceEnabled);
  readonly buyerIdRequired = computed(() =>
    this.eInvoiceEnabled() && this.totalAmount() >= ETA_BUYER_ID_THRESHOLD
  );
  readonly buyerIdInvalid = computed(() =>
    this.buyerNationalId().trim() !== '' && !NATIONAL_ID_PATTERN.test(this.buyerNationalId().trim())
  );
  readonly buyerIdMissing = computed(() =>
    this.buyerIdRequired() && (this.buyerNationalId().trim() === '' || this.buyerName().trim() === '')
  );
  readonly hasPrescriptionRequiredItem = computed(() =>
    this.requirePrescriptionUpload() && this.cartItems().some(item => item.product.prescriptionRequired)
  );
  readonly isSubmitDisabled = computed(() =>
    this.loading() || this.isCartEmpty() || this.totalAmount() <= 0 ||
    this.prescriptionUploading() ||
    (this.hasPrescriptionRequiredItem() && !this.prescriptionImageUrl()) ||
    this.buyerIdInvalid() || this.buyerIdMissing()
  );

  readonly PaymentMethod = PaymentMethod;
  readonly allPaymentMethodOptions = [
    { value: PaymentMethod.CASH, label: 'SALES.CASH', icon: 'payments' },
    { value: PaymentMethod.VISA, label: 'SALES.VISA', icon: 'credit_card' },
    { value: PaymentMethod.INSTAPAY, label: 'SALES.INSTAPAY', icon: 'account_balance' },
    { value: PaymentMethod.FAWRY, label: 'SALES.FAWRY', icon: 'store' },
    { value: PaymentMethod.WALLET, label: 'SALES.WALLET', icon: 'account_balance_wallet' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'SALES.BANK_TRANSFER', icon: 'transfer_within_a_station' }
  ];

  private readonly enabledPaymentMethodCodes = signal<Set<string>>(new Set(Object.values(PaymentMethod)));
  readonly paymentMethods = computed(() =>
    this.allPaymentMethodOptions.filter(m => this.enabledPaymentMethodCodes().has(m.value))
  );

  // Defaults to true (the historical, always-on behavior) until the real
  // pharmacy setting loads, so checkout isn't briefly unguarded on first render.
  private readonly requirePrescriptionUpload = signal(true);

  ngOnInit(): void {
    this.loadProducts();
    this.filteredProductsSubject.next(this.allProducts().slice(0, 10));
    this.loadEnabledPaymentMethods();
    this.voiceSearchSupported.set(!!this.getSpeechRecognitionCtor());

    this.productControl.valueChanges.pipe(startWith('')).subscribe(value => {
      const searchValue = typeof value === 'string' ? value : value?.name || '';
      this.filteredProductsSubject.next(this._filterProducts(searchValue));
    });
  }

  private getSpeechRecognitionCtor(): any {
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  }

  startVoiceSearch(): void {
    if (this.isListening()) return;

    const SpeechRecognitionCtor = this.getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    this.speechRecognition = recognition;
    recognition.lang = this.languageService.getCurrentLanguage() === 'ar' ? 'ar-EG' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => this.isListening.set(true);
    recognition.onend = () => this.isListening.set(false);
    recognition.onerror = () => this.isListening.set(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        this.productControl.setValue(transcript.trim());
      }
    };

    recognition.start();
  }

  stopVoiceSearch(): void {
    this.speechRecognition?.stop();
  }

  ngAfterViewInit(): void {
    this.focusBarcodeInput();
  }

  private focusBarcodeInput(): void {
    setTimeout(() => this.barcodeInputRef?.nativeElement.focus(), 0);
  }

  onBarcodeScan(): void {
    const code = this.barcodeValue().trim();
    this.barcodeValue.set('');
    this.focusBarcodeInput();
    if (!code) return;

    const product = this.allProducts().find(p => p.barcode?.trim() === code);
    if (!product) {
      this.errorHandler.showWarning('SALES.BARCODE_NOT_FOUND', { params: { code } });
      return;
    }
    this.addProductToCart(product);
  }

  private loadEnabledPaymentMethods(): void {
    this.pharmacySettingsService.getSettings().subscribe({
      next: (settings) => {
        this.requirePrescriptionUpload.set(settings?.requirePrescriptionUpload ?? true);

        if (!settings?.enabledPaymentMethods) return;

        const codes = settings.enabledPaymentMethods.split(',').map(c => c.trim()).filter(Boolean);
        if (!codes.length) return;

        this.enabledPaymentMethodCodes.set(new Set(codes));

        if (!codes.includes(this.paymentMethod())) {
          const fallback = this.paymentMethods()[0]?.value ?? PaymentMethod.CASH;
          this.paymentMethod.set(fallback);
        }
      }
    });
  }

  private _filterProducts(value: string): Product[] {
    if (!value) return this.allProducts().slice(0, 10);
    const filterValue = value.toLowerCase();
    return this.allProducts()
      .filter(p =>
        p.name.toLowerCase().includes(filterValue) ||
        p.barcode?.toLowerCase().includes(filterValue) ||
        p.scientificName?.toLowerCase().includes(filterValue) ||
        p.activeIngredient?.toLowerCase().includes(filterValue)
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
        this.setProducts(data);
        this.syncCartPrices(data);
        this.catalogSavedAt.set(null);
        this.offline.cacheCatalog(data);
      },
      error: (err) => {
        if (this.offline.enabled() && !err?.status) {
          void this.loadCachedProducts();
          return;
        }
        this.errorHandler.handleHttpError(err, 'PRODUCTS.LOAD_ERROR');
      }
    });
  }

  private setProducts(data: Product[]): void {
    this.allProducts.set(data);
    this.products.set(data);
    this.filteredProductsSubject.next(data.slice(0, 10));
  }

  // The server charges its own current prices; after a reload, cart lines
  // show those too so the total on screen is what gets recorded.
  private syncCartPrices(products: Product[]): void {
    if (!this.cartItems().length) return;
    const byId = new Map(products.map(p => [p.id, p]));
    this.cartItems.set(this.cartItems().map(item => {
      const fresh = byId.get(item.product.id);
      if (!fresh) return item;
      const unitPrice = fresh.sellPrice || 0;
      return { ...item, product: fresh, unitPrice, totalPrice: unitPrice * item.quantity };
    }));
  }

  // Server unreachable: sell from the product list saved on this device.
  private async loadCachedProducts(): Promise<void> {
    const cached = await this.offline.cachedCatalog();
    if (!cached?.products?.length) {
      this.errorHandler.showError('SALES.OFFLINE.NO_CATALOG');
      return;
    }
    this.setProducts(cached.products);
    this.catalogSavedAt.set(cached.savedAt);
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
      // Out of stock: offer what else has the same active ingredient.
      if (this.alternativesOf(product).some(p => p.totalStock > 0)) {
        this.openAlternatives(product);
      } else {
        this.errorHandler.showWarning('SALES.INSUFFICIENT_STOCK');
      }
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

  // Same active ingredient, in stock first, then cheapest.
  alternativesOf(product: Product): Product[] {
    if (!product.ingredientKey) return [];
    return (this.productsByIngredient().get(product.ingredientKey) ?? [])
      .filter(p => p.id !== product.id)
      .sort((a, b) => Number(b.totalStock > 0) - Number(a.totalStock > 0) || (a.sellPrice || 0) - (b.sellPrice || 0));
  }

  // Picking an alternative adds it to the cart, or swaps it in for `replacing`.
  openAlternatives(product: Product, replacing?: CartItem): void {
    const data: ProductAlternativesData = { product, alternatives: this.alternativesOf(product) };
    this.dialog.open<ProductAlternativesDialogComponent, ProductAlternativesData, Product>(
      ProductAlternativesDialogComponent, { data, autoFocus: false })
      .afterClosed()
      .subscribe(picked => {
        if (!picked) return;
        if (replacing) {
          this.replaceInCart(replacing, picked);
        } else {
          this.addProductToCart(picked);
        }
      });
  }

  // Keeps the cart line's place and quantity (capped at the alternative's
  // stock); merges into the alternative's line if it's already in the cart.
  private replaceInCart(item: CartItem, replacement: Product): void {
    const unitPrice = replacement.sellPrice || 0;
    if (unitPrice === 0) {
      this.errorHandler.showWarning('SALES.NO_PRICE', { params: { name: replacement.name } });
      return;
    }
    const existing = this.cartItems().find(i => i !== item && i.product.id === replacement.id);
    const wanted = item.quantity + (existing?.quantity ?? 0);
    const quantity = Math.min(wanted, replacement.totalStock);
    if (quantity < wanted) {
      this.errorHandler.showWarning('SALES.ALTERNATIVES.QUANTITY_REDUCED', { params: { count: quantity } });
    }
    const replaced: CartItem = { product: replacement, quantity, unitPrice, totalPrice: quantity * unitPrice };
    this.cartItems.set(this.cartItems()
      .filter(i => i !== existing)
      .map(i => (i === item ? replaced : i)));
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
    this.buyerNationalId.set('');
    this.buyerName.set('');
    this.productControl.setValue('');
    this.prescriptionImageUrl.set(null);
  }

  onPrescriptionFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.prescriptionUploading.set(true);
    this.prescriptionService.upload(file).subscribe({
      next: (result) => {
        this.prescriptionImageUrl.set(result.url);
        this.prescriptionUploading.set(false);
      },
      error: (error) => {
        this.prescriptionUploading.set(false);
        this.errorHandler.handleHttpError(error, 'SALES.PRESCRIPTION_UPLOAD_ERROR');
      }
    });
    input.value = '';
  }

  removePrescription(): void {
    this.prescriptionImageUrl.set(null);
  }

  async onSubmit(): Promise<void> {
    if (!this.validateSale()) return;

    const saleRequest = this.mapCartToSaleRequest();
    if (this.offline.enabled() && !this.offline.online()) {
      await this.sellOffline(saleRequest);
      return;
    }

    this.loading.set(true);
    // Set once the customer has been charged, so a sale the server then
    // refuses doesn't leave them paying for nothing.
    let chargedReference: string | undefined;
    try {
      if (this.paymentMethod() !== PaymentMethod.CASH) {
        const paymentResponse = await this.processPayment(saleRequest.totalAmount);

        if (paymentResponse.status === 'FAILED') {
          this.errorHandler.showError('PAYMENT.FAILED');
          this.loading.set(false);
          return;
        }

        if (paymentResponse.status === 'PENDING') {
          await this.handlePendingPayment(paymentResponse);
        }
        chargedReference = paymentResponse.referenceNumber;
      }

      const saleResponse = await this.createSale(saleRequest);
      this.handleSaleSuccess(saleResponse);
    } catch (error: any) {
      // Couldn't reach the server for a cash sale: queue it (same
      // clientSaleId, so if the request did land it isn't recorded twice).
      if (this.offline.enabled() && !error?.status && this.paymentMethod() === PaymentMethod.CASH) {
        this.offline.online.set(false);
        await this.sellOffline(saleRequest);
        return;
      }
      console.error('Sale submission error:', error);
      // Only when the server answered and refused: with no answer the sale
      // may still have been recorded (it's idempotent on clientSaleId).
      if (chargedReference && error?.status) {
        await this.cancelCharge(chargedReference);
      }
      if (error?.code === 'SALE_PRICE_CHANGED') {
        // The cart had an old price: refresh prices so the cashier can review.
        this.loadProducts();
      }
      if (!this.errorHandler.showByCode(error.code, error.params)) {
        this.errorHandler.showError(error.message || 'SALES.CREATE_ERROR');
      }
    } finally {
      this.loading.set(false);
    }
  }

  private async cancelCharge(reference: string): Promise<void> {
    try {
      await firstValueFrom(this.paymentService.cancelPayment(reference));
      this.errorHandler.showWarning('PAYMENT.CANCELLED_SALE_REFUSED');
    } catch {
      this.errorHandler.showError('PAYMENT.CANCEL_FAILED_REFUND_MANUALLY', { params: { reference } });
    }
  }

  // Card and wallet payments need the gateway, so offline sales are cash only.
  private async sellOffline(saleRequest: SaleRequest): Promise<void> {
    if (this.paymentMethod() !== PaymentMethod.CASH) {
      this.errorHandler.showWarning('SALES.OFFLINE.CASH_ONLY');
      return;
    }
    try {
      await this.offline.enqueue({ ...saleRequest, soldAt: new Date().toISOString() }, this.totalAmount());
    } catch {
      this.errorHandler.showError('SALES.OFFLINE.QUEUE_FAILED');
      return;
    }
    await Swal.fire({
      icon: 'info',
      title: this.translate.instant('SALES.OFFLINE.SAVED_TITLE'),
      text: this.translate.instant('SALES.OFFLINE.SAVED_TEXT', { total: this.formatCurrency(this.totalAmount()) }),
      confirmButtonText: this.translate.instant('COMMON.CONTINUE'),
      confirmButtonColor: '#667eea',
      timer: 6000,
      timerProgressBar: true
    });
    // Stay on the POS - sales history needs the server.
    this.clearCart();
  }

  failureReason(sale: QueuedSale): string {
    if (sale.errorCode) {
      const key = `ERRORS.${sale.errorCode}`;
      const translated = this.translate.instant(key);
      if (translated !== key) return translated;
    }
    return sale.errorMessage || this.translate.instant('SALES.CREATE_ERROR');
  }

  retryQueuedSale(clientSaleId: string): void {
    void this.offline.retry(clientSaleId);
  }

  async discardQueuedSale(clientSaleId: string): Promise<void> {
    const result = await Swal.fire({
      icon: 'warning',
      title: this.translate.instant('SALES.OFFLINE.DISCARD_TITLE'),
      text: this.translate.instant('SALES.OFFLINE.DISCARD_TEXT'),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('SALES.OFFLINE.DISCARD'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
      confirmButtonColor: '#dc2626'
    });
    if (result.isConfirmed) {
      await this.offline.discard(clientSaleId);
    }
  }

  private async handlePendingPayment(paymentResponse: PaymentResponse): Promise<void> {
    await Swal.fire({
      icon: 'info',
      title: this.translate.instant('PAYMENTS.PENDING_TITLE'),
      text: paymentResponse.message || this.translate.instant('PAYMENTS.PENDING_MESSAGE'),
      confirmButtonText: this.translate.instant('COMMON.OK'),
      confirmButtonColor: '#f59e0b'
    });
  }

  private async processPayment(amount: number): Promise<PaymentResponse> {
    const request: PaymentRequest = {
      pharmacyId: this.authService.getPharmacyId() || 1,
      amount,
      paymentMethod: this.paymentMethod(),
      customerName: '',
      customerPhone: this.customerPhone(),
      customerEmail: '',
      description: `Sale - ${new Date().toLocaleDateString('ar-EG')}`
    };

    return new Promise((resolve, reject) => {
      this.paymentService.processPayment(request).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error)
      });
    });
  }

  private async createSale(saleRequest: SaleRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.salesService.createSale(saleRequest).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error)
      });
    });
  }

  private validateSale(): boolean {
    if (this.isCartEmpty()) {
      this.errorHandler.showWarning('SALES.EMPTY_CART');
      return false;
    }
    if (this.totalAmount() <= 0) {
      this.errorHandler.showWarning('SALES.INVALID_TOTAL');
      return false;
    }
    if (this.hasPrescriptionRequiredItem() && !this.prescriptionImageUrl()) {
      this.errorHandler.showWarning('SALES.PRESCRIPTION_REQUIRED');
      return false;
    }
    return true;
  }

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
      buyerNationalId: this.buyerNationalId().trim() || undefined,
      buyerName: this.buyerName().trim() || undefined,
      totalAmount: this.subtotal(),
      prescriptionImageUrl: this.prescriptionImageUrl() || undefined,
      clientSaleId: this.offline.newClientSaleId()
    };
  }

  private handleSaleSuccess(response: any): void {
    const invoiceNumber = response?.invoiceNumber || response?.data?.invoiceNumber || `INV-${Date.now()}`;
    const totalAmount = response?.totalAmount || this.totalAmount();

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
      willClose: () => {
        if ((window as any).copyInvoiceNumber) {
          delete (window as any).copyInvoiceNumber;
        }
      }
    }).then(() => {
      this.finalizeSale();
    });
  }

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
      <div style="margin-top: 10px; font-size: 13px; color: #667eea;">
        <strong>${this.getPaymentMethodLabel(this.paymentMethod())}</strong>
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
    return this.currencyService.format(amount, this.languageService.getCurrentLanguage());
  }

  getCurrencySuffix(): string {
    return this.currencyService.getSuffix(this.languageService.getCurrentLanguage());
  }

  getPaymentMethodLabel(method: string): string {
    return this.translate.instant(`PAYMENTS.${method}`);
  }

  getStockLabel(stock: number): string {
    return this.translate.instant('SALES.AVAILABLE', { count: stock });
  }
}
