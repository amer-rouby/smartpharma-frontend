import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';
import { applyChartJsTheme } from './core/utils/chart-theme.util';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl:"./app.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('smartpharma-frontend');

  private readonly translate = inject(TranslateService);
  // Injected here so Chart.js picks up colors before the first chart renders.
  private readonly themeService = inject(ThemeService);
  readonly direction = signal<'rtl' | 'ltr'>('rtl');
  readonly currentLang = signal<string>('ar');

  constructor() {
    // currentTheme$ is a BehaviorSubject, so this also covers the initial load.
    this.themeService.currentTheme$.subscribe(() => applyChartJsTheme());
  }

  ngOnInit(): void {
    const lang = localStorage.getItem('language') || 'ar';
    this.setDirection(lang);
    this.translate.onLangChange.subscribe((event) => {
      this.setDirection(event.lang);
    });
  }

  private setDirection(lang: string): void {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.direction.set(dir);
    this.currentLang.set(lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;

    // Material's notch measurement doesn't re-run on dir change; forcing a
    // resize event fixes every already-rendered field at once.
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }
}
