// ✅ تأكد إن الـ imports صحيحة
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, startWith, map, BehaviorSubject } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductService } from '../../../core/services/product.service';
import { SalesService } from '../../../core/services/sales.service';
import Swal from 'sweetalert2';
import { Product } from '../../../core/models/product.model';
import { MaterialModule } from '../../../shared/material.module';


// ✅ عرف الـ interface دي
interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    PageHeaderComponent
  ],
  templateUrl: './sales-form.component.html',
  styleUrls: ['./sales-form.component.scss']
})
export class SalesFormComponent implements OnInit {
  displayedColumns: string[] = ['product', 'quantity', 'price', 'total', 'actions'];
  cartItems = signal<CartItem[]>([]);
  productControl = new FormControl();
  filteredProducts!: Observable<Product[]>;
  products = signal<Product[]>([]);
  customerPhone = signal('');
  paymentMethod = signal('CASH');
  discount = signal(0);
  loading = signal(false);
  allProducts: Product[] = [];
  private filteredProductsSubject = new BehaviorSubject<Product[]>([]);
  public currentFilteredProducts$ = this.filteredProductsSubject.asObservable();

  constructor(
    private productService: ProductService,
    private salesService: SalesService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.filteredProducts = this.productControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const searchValue = typeof value === 'string' ? value : value?.name || '';
        const filtered = this._filterProducts(searchValue);
        this.filteredProductsSubject.next(filtered);
        return filtered;
      })
    );
    this.filteredProductsSubject.next(this.allProducts.slice(0, 10));
  }

  private _filterProducts(value: string): Product[] {
    if (!value) {
      return this.allProducts.slice(0, 10);
    }
    const filterValue = value.toLowerCase();
    return this.allProducts.filter(product =>
      product.name.toLowerCase().includes(filterValue) ||
      product.barcode?.toLowerCase().includes(filterValue)
    ).slice(0, 10);
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        console.log('Products Response:', response);
        this.allProducts = response.data || [];
        this.allProducts = this.allProducts.map(p => ({
          ...p,
          sellPrice: p.sellPrice || 0
        }));
        this.products.set(this.allProducts);
        this.filteredProductsSubject.next(this.allProducts.slice(0, 10));
        console.log('Products with prices:', this.allProducts);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('حدث خطأ أثناء تحميل المنتجات', 'إغلاق', { duration: 3000 });
      }
    });
  }

  displayProduct(product: Product): string {
    return product?.name || '';
  }

  onProductSelected(product: Product): void {
    if (!product) return;
    console.log('Selected product:', product);
    console.log('Product sellPrice:', product.sellPrice);
    this.addProductToCart(product);
    setTimeout(() => {
      this.productControl.setValue('');
    }, 100);
  }

  onAddFirstProduct(): void {
    const filtered = this.filteredProductsSubject.getValue();
    if (filtered && filtered.length > 0) {
      this.onProductSelected(filtered[0]);
    }
  }

  isAddButtonDisabled(): boolean {
    const filtered = this.filteredProductsSubject.getValue();
    return !filtered || filtered.length === 0;
  }

  addProductToCart(product: Product): void {
    if (product.totalStock <= 0) {
      this.snackBar.open('المنتج غير متوفر في المخزون', 'إغلاق', { duration: 3000 });
      return;
    }

    const unitPrice = product.sellPrice || 0;
    if (unitPrice === 0) {
      this.snackBar.open(`المنتج "${product.name}" ليس له سعر!`, 'إغلاق', { duration: 3000 });
      return;
    }

    const currentItems = this.cartItems();
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.totalStock) {
        this.snackBar.open('الكمية المطلوبة تتجاوز المخزون المتاح', 'إغلاق', { duration: 3000 });
        return;
      }
      const updatedItems = currentItems.map(item =>
        item.product.id === product.id
          ? {
            ...item,
            quantity: item.quantity + 1,
            totalPrice: (item.quantity + 1) * item.unitPrice
          }
          : item
      );
      this.cartItems.set(updatedItems);
    } else {
      const newItem: CartItem = {
        product: product,
        quantity: 1,
        unitPrice: unitPrice,
        totalPrice: unitPrice
      };
      this.cartItems.set([...currentItems, newItem]);
    }
    console.log('Cart after adding:', this.cartItems());
  }

  removeFromCart(index: number): void {
    const currentItems = this.cartItems();
    const updatedItems = currentItems.filter((_, i) => i !== index);
    this.cartItems.set(updatedItems);
  }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(this.cartItems().indexOf(item));
      return;
    }
    if (quantity > item.product.totalStock) {
      this.snackBar.open('الكمية المطلوبة تتجاوز المخزون المتاح', 'إغلاق', { duration: 3000 });
      return;
    }
    const currentItems = this.cartItems();
    const updatedItems = currentItems.map(cartItem =>
      cartItem.product.id === item.product.id
        ? { ...cartItem, quantity, totalPrice: quantity * cartItem.unitPrice }
        : cartItem
    );
    this.cartItems.set(updatedItems);
  }

  getSubtotal(): number {
    const total = this.cartItems().reduce((sum, item) => sum + item.totalPrice, 0);
    console.log('Subtotal:', total);
    return total;
  }

  getTotalAmount(): number {
    return Math.max(0, this.getSubtotal() - this.discount());
  }

  onSubmit(): void {
    if (this.cartItems().length === 0) {
      this.snackBar.open('يرجى إضافة منتجات على الأقل', 'إغلاق', { duration: 3000 });
      return;
    }
    if (this.getTotalAmount() <= 0) {
      this.snackBar.open('المبلغ الإجمالي يجب أن يكون أكبر من صفر', 'إغلاق', { duration: 3000 });
      return;
    }

    this.loading.set(true);

    const saleRequest = {
      items: this.cartItems().map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      discountAmount: this.discount(),
      paymentMethod: this.paymentMethod(),
      customerPhone: this.customerPhone(),
      totalAmount: this.getTotalAmount() + this.discount()
    };

    console.log('Sale Request:', saleRequest);

    this.salesService.createSale(saleRequest).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        Swal.fire({
          icon: 'success',
          title: 'تمت عملية البيع بنجاح',
          text: `رقم الفاتورة: ${response.data?.invoiceNumber || 'N/A'}`,
          timer: 3000,
          showConfirmButton: false
        });
        this.cartItems.set([]);
        this.productControl.setValue('');
        this.discount.set(0);
        this.customerPhone.set('');
        this.router.navigate(['/sales/history']);
      },
      error: (error: any) => {
        this.loading.set(false);
        console.error('Sale error:', error);
        this.snackBar.open(error.error?.message || 'حدث خطأ أثناء عملية البيع', 'إغلاق', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    if (this.cartItems().length > 0) {
      Swal.fire({
        title: 'هل أنت متأكد؟',
        text: 'سيتم إلغاء الفاتورة الحالية',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'نعم، إلغاء',
        cancelButtonText: 'لا'
      }).then((result) => {
        if (result.isConfirmed) {
          this.cartItems.set([]);
          this.discount.set(0);
          this.customerPhone.set('');
          this.productControl.setValue('');
        }
      });
    }
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.discount.set(0);
    this.customerPhone.set('');
    this.productControl.setValue('');
  }
}
