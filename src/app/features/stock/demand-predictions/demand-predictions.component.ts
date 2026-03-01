import { Component, inject, signal, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { DemandPredictionService, DemandPrediction, PredictionStats } from '../../../core/services/demand-prediction.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-demand-predictions',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, MatPaginatorModule],
  templateUrl: './demand-predictions.component.html',
  styleUrl: './demand-predictions.component.scss'
})
export class DemandPredictionsComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly predictionService = inject(DemandPredictionService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly predictions = signal<DemandPrediction[]>([]);
  readonly stats = signal<PredictionStats | null>(null);
  readonly daysAhead = signal(7);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = signal(0);
  readonly pageSizeOptions = [5, 10, 20, 50];

  readonly displayedColumns = ['productName', 'predictionDate', 'predictedQuantity', 'currentStock', 'recommendedOrder', 'trend', 'confidence', 'actions'];

  ngOnInit(): void {
    this.loadPredictions();
    this.loadStats();
  }

  loadPredictions(): void {
    this.loading.set(true);
    this.predictionService.getPredictionsWithPagination(this.pageIndex(), this.pageSize()).subscribe({
      next: (data) => {
        console.log('✅ Predictions loaded:', data);  // ✅ Debug log
        this.predictions.set(data.content || []);
        this.totalElements.set(data.totalElements || 0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading predictions:', error);
        this.snackBar.open(
          this.translate.instant('PREDICTIONS.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.predictionService.getAccuracyStats().subscribe({
      next: (data) => {
        console.log('✅ Stats loaded:', data);  // ✅ Debug log
        this.stats.set(data);
      },
      error: (error) => {
        console.error('❌ Error loading stats:', error);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadPredictions();
  }

  onGeneratePredictions(): void {
    this.loading.set(true);
    this.predictionService.generatePredictions().subscribe({
      next: () => {
        this.loading.set(false);
        this.loadPredictions();
        this.loadStats();
        this.snackBar.open(
          this.translate.instant('PREDICTIONS.GENERATED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('PREDICTIONS.GENERATE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      }
    });
  }

  onViewPrediction(prediction: DemandPrediction): void {
    this.router.navigate(['/predictions', prediction.predictionId, 'details']);
  }

  onCreatePurchaseOrder(prediction: DemandPrediction): void {
    const message = this.translate.instant('PREDICTIONS.CONFIRM_PURCHASE', {
      product: prediction.productName,
      quantity: prediction.recommendedOrder
    });

    if (confirm(message)) {
      this.router.navigate(['/purchases/new'], {
        queryParams: {
          productId: prediction.productId,
          quantity: prediction.recommendedOrder,
          predictionId: prediction.predictionId,
          source: 'prediction'
        }
      });
    }
  }

  onQuickOrder(prediction: DemandPrediction): void {
    this.loading.set(true);
    this.predictionService.createPurchaseFromPrediction(prediction.predictionId).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('PREDICTIONS.ORDER_CREATED', { product: prediction.productName }),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.loadPredictions();
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('PREDICTIONS.ORDER_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      }
    });
  }

  getTrendIcon(trend: string): string {
    const icons: Record<string, string> = {
      'increasing': 'trending_up',
      'decreasing': 'trending_down',
      'stable': 'trending_flat'
    };
    return icons[trend] || 'trending_flat';
  }

  getTrendColor(trend: string): string {
    const colors: Record<string, string> = {
      'increasing': '#ef4444',
      'decreasing': '#10b981',
      'stable': '#6b7280'
    };
    return colors[trend] || '#6b7280';
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.6) return '#f59e0b';
    return '#ef4444';
  }

  getRecommendationColor(recommendedOrder: number): string {
    if (recommendedOrder > 50) return '#ef4444';
    if (recommendedOrder > 20) return '#f59e0b';
    return '#10b981';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDaysUntil(dateString: string): number {
    const predictionDate = new Date(dateString);
    const today = new Date();
    const diffTime = predictionDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
