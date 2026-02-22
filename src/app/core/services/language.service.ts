import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly supportedLanguages = ['ar', 'en'];
  private readonly defaultLanguage = 'ar';

  constructor() {
    this.translate.addLangs(this.supportedLanguages);
    this.translate.setDefaultLang(this.defaultLanguage);

    const savedLang = localStorage.getItem('language');
    const browserLang = this.translate.getBrowserLang();
    const langToUse = savedLang || (this.supportedLanguages.includes(browserLang!) ? browserLang! : this.defaultLanguage);

    this.setLanguage(langToUse as 'ar' | 'en');
  }

  setLanguage(lang: 'ar' | 'en'): void {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || 'ar';
  }

  isRTL(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }

  toggleLanguage(): void {
    const newLang = this.isRTL() ? 'en' : 'ar';
    this.setLanguage(newLang);
  }
}
