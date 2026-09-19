import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark';
export type ColorTheme =
  | 'indigo' | 'teal' | 'rose' | 'amber' | 'sky'
  | 'orange' | 'lime' | 'green' | 'emerald' | 'cyan'
  | 'blue' | 'violet' | 'purple' | 'fuchsia' | 'pink';

export interface ColorThemeOption {
  value: ColorTheme;
  labelKey: string;
  descKey: string;
  swatch: string;
}

export const COLOR_THEMES: ColorThemeOption[] = [
  { value: 'indigo', labelKey: 'SETTINGS.APPEARANCE.INDIGO', descKey: 'SETTINGS.APPEARANCE.INDIGO_DESC', swatch: '#4f46e5' },
  { value: 'teal', labelKey: 'SETTINGS.APPEARANCE.TEAL', descKey: 'SETTINGS.APPEARANCE.TEAL_DESC', swatch: '#0d9488' },
  { value: 'rose', labelKey: 'SETTINGS.APPEARANCE.ROSE', descKey: 'SETTINGS.APPEARANCE.ROSE_DESC', swatch: '#e11d48' },
  { value: 'amber', labelKey: 'SETTINGS.APPEARANCE.AMBER', descKey: 'SETTINGS.APPEARANCE.AMBER_DESC', swatch: '#d97706' },
  { value: 'sky', labelKey: 'SETTINGS.APPEARANCE.SKY', descKey: 'SETTINGS.APPEARANCE.SKY_DESC', swatch: '#0284c7' },
  { value: 'orange', labelKey: 'SETTINGS.APPEARANCE.ORANGE', descKey: 'SETTINGS.APPEARANCE.ORANGE_DESC', swatch: '#ea580c' },
  { value: 'lime', labelKey: 'SETTINGS.APPEARANCE.LIME', descKey: 'SETTINGS.APPEARANCE.LIME_DESC', swatch: '#65a30d' },
  { value: 'green', labelKey: 'SETTINGS.APPEARANCE.GREEN', descKey: 'SETTINGS.APPEARANCE.GREEN_DESC', swatch: '#16a34a' },
  { value: 'emerald', labelKey: 'SETTINGS.APPEARANCE.EMERALD', descKey: 'SETTINGS.APPEARANCE.EMERALD_DESC', swatch: '#059669' },
  { value: 'cyan', labelKey: 'SETTINGS.APPEARANCE.CYAN', descKey: 'SETTINGS.APPEARANCE.CYAN_DESC', swatch: '#0891b2' },
  { value: 'blue', labelKey: 'SETTINGS.APPEARANCE.BLUE', descKey: 'SETTINGS.APPEARANCE.BLUE_DESC', swatch: '#2563eb' },
  { value: 'violet', labelKey: 'SETTINGS.APPEARANCE.VIOLET', descKey: 'SETTINGS.APPEARANCE.VIOLET_DESC', swatch: '#7c3aed' },
  { value: 'purple', labelKey: 'SETTINGS.APPEARANCE.PURPLE', descKey: 'SETTINGS.APPEARANCE.PURPLE_DESC', swatch: '#9333ea' },
  { value: 'fuchsia', labelKey: 'SETTINGS.APPEARANCE.FUCHSIA', descKey: 'SETTINGS.APPEARANCE.FUCHSIA_DESC', swatch: '#c026d3' },
  { value: 'pink', labelKey: 'SETTINGS.APPEARANCE.PINK', descKey: 'SETTINGS.APPEARANCE.PINK_DESC', swatch: '#db2777' },
];

const COLOR_THEME_CLASSES = COLOR_THEMES.map(t => `theme-${t.value}`);

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly currentThemeSubject = new BehaviorSubject<ThemeMode>('light');
  readonly currentTheme$: Observable<ThemeMode> = this.currentThemeSubject.asObservable();

  private readonly currentColorThemeSubject = new BehaviorSubject<ColorTheme>('indigo');
  readonly currentColorTheme$: Observable<ColorTheme> = this.currentColorThemeSubject.asObservable();

  constructor() {
    this.initializeTheme();
    this.initializeColorTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const themeToUse: ThemeMode = savedTheme ?? (prefersDark ? 'dark' : 'light');
    this.setTheme(themeToUse);
  }

  private initializeColorTheme(): void {
    const saved = localStorage.getItem('colorTheme') as ColorTheme | null;
    const colorTheme = COLOR_THEMES.some(t => t.value === saved) ? (saved as ColorTheme) : 'indigo';
    this.setColorTheme(colorTheme);
  }

  setTheme(theme: ThemeMode): void {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    document.body.style.backgroundColor = theme === 'dark' ? '#0f172a' : '#f1f5f9';
    document.body.style.color = theme === 'dark' ? '#f1f5f9' : '#1e293b';
    this.currentThemeSubject.next(theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme(): void {
    this.setTheme(this.getCurrentTheme() === 'dark' ? 'light' : 'dark');
  }

  getCurrentTheme(): ThemeMode {
    return this.currentThemeSubject.getValue();
  }

  isDark(): boolean {
    return this.getCurrentTheme() === 'dark';
  }

  setColorTheme(colorTheme: ColorTheme): void {
    document.body.classList.remove(...COLOR_THEME_CLASSES);
    document.body.classList.add(`theme-${colorTheme}`);
    this.currentColorThemeSubject.next(colorTheme);
    localStorage.setItem('colorTheme', colorTheme);
  }

  getCurrentColorTheme(): ColorTheme {
    return this.currentColorThemeSubject.getValue();
  }
}
