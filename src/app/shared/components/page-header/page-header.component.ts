import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl:"./page-header.component.html",
  styleUrl:"./page-header.component.scss"
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
}
