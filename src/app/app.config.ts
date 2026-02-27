import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
  APP_INITIALIZER
} from '@angular/core';

import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  HttpClient
} from '@angular/common/http';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import {
  TranslateModule,
  TranslateLoader,
  TranslateService
} from '@ngx-translate/core';

import { Observable, firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) { }

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`assets/i18n/${lang}.json`);
  }
}

export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

export function initializeApp(translate: TranslateService): () => Promise<void> {
  return async () => {
    const savedLang = localStorage.getItem('language') || 'ar';
    translate.setDefaultLang('ar');
    await firstValueFrom(translate.use(savedLang));
    const dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = savedLang;
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        },
        defaultLanguage: 'ar'
      })
    ),

    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [TranslateService],
      multi: true
    }
  ]
};
