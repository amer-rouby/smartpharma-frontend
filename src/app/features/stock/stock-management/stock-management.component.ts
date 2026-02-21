import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    PageHeaderComponent
  ],
  templateUrl: './stock-management.component.html',
  styleUrls: ['./stock-management.component.scss']
})
export class StockManagementComponent {
  displayedColumns: string[] = ['product', 'batch', 'quantity', 'expiry', 'status', 'actions'];
  stockBatches: any[] = [];

  constructor() { }
}
