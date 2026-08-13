import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-auth-background',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './auth-background.component.html',
  styleUrl: './auth-background.component.scss'
})
export class AuthBackgroundComponent {
  readonly floatingIcons = [
    'medication',
    'local_pharmacy',
    'health_and_safety',
    'vaccines',
    'monitor_heart',
    'science'
  ];
}
