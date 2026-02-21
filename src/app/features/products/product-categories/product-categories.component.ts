import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MatChipsModule } from '@angular/material/chips';
import { MaterialModule } from '../../../shared/material.module';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  productCount: number;
  color: string;
}

@Component({
  selector: 'app-product-categories',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    PageHeaderComponent,
  ],
  templateUrl: './product-categories.component.html',
  styleUrls: ['./product-categories.component.scss']
})
export class ProductCategoriesComponent {
  displayedColumns: string[] = ['icon', 'name', 'description', 'productCount', 'actions'];

  categories: Category[] = [
    { id: 1, name: 'مسكنات', description: 'أدوية تسكين الألم', icon: 'healing', productCount: 25, color: '#667eea' },
    { id: 2, name: 'مضادات حيوية', description: 'أدوية مكافحة البكتيريا', icon: 'coronavirus', productCount: 18, color: '#764ba2' },
    { id: 3, name: 'قلب وأوعية', description: 'أدوية القلب والشرايين', icon: 'favorite', productCount: 12, color: '#f093fb' },
    { id: 4, name: 'معدة', description: 'أدوية الجهاز الهضمي', icon: 'water_drop', productCount: 15, color: '#f5576c' },
    { id: 5, name: 'حساسية', description: 'أدوية الحساسية', icon: 'allergy', productCount: 10, color: '#4facfe' },
    { id: 6, name: 'فيتامينات', description: 'المكملات الغذائية', icon: 'local_pharmacy', productCount: 20, color: '#43e97b' }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  onEdit(category: Category): void {
    this.snackBar.open(`تعديل تصنيف: ${category.name}`, 'إغلاق', { duration: 3000 });
  }

  onDelete(category: Category): void {
    this.snackBar.open(`حذف تصنيف: ${category.name}`, 'إغلاق', { duration: 3000 });
  }

  onAdd(): void {
    this.snackBar.open('إضافة تصنيف جديد', 'إغلاق', { duration: 3000 });
  }
}
