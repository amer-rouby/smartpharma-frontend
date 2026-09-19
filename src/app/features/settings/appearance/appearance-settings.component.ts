import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { ThemeService, ThemeMode, ColorTheme, COLOR_THEMES } from '../../../core/services/theme.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-appearance-settings',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent],
  templateUrl: './appearance-settings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './appearance-settings.component.scss'
})
export class AppearanceSettingsComponent {
  private readonly themeService = inject(ThemeService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly colorThemes = COLOR_THEMES;
  readonly mode = signal<ThemeMode>(this.themeService.getCurrentTheme());
  readonly colorTheme = signal<ColorTheme>(this.themeService.getCurrentColorTheme());

  constructor() {
    this.themeService.currentTheme$.subscribe(mode => this.mode.set(mode));
    this.themeService.currentColorTheme$.subscribe(theme => this.colorTheme.set(theme));
  }

  setMode(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
  }

  setColorTheme(theme: ColorTheme): void {
    this.themeService.setColorTheme(theme);
  }

  onSave(): void {
    // Mode/color already persist instantly on click; this just confirms the choice.
    this.errorHandler.showSuccess('SETTINGS.APPEARANCE.SAVE_SUCCESS');
  }

  onReset(): void {
    this.themeService.setTheme('light');
    this.themeService.setColorTheme('indigo');
  }
}
