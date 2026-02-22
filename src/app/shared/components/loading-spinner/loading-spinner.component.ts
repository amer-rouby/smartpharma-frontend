import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: "./loading-spinner.component.html",
  styleUrl:"./loading-spinner.component.scss"
})
export class LoadingSpinnerComponent {
  isLoading = false;
}
