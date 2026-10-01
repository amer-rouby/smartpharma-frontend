import { Injectable, NgZone, inject, signal } from '@angular/core';

// Browser speech-to-text for search boxes (Web Speech API). One phrase per
// start(); `supported` is false in browsers without it (e.g. Firefox).
@Injectable({ providedIn: 'root' })
export class VoiceSearchService {
  private readonly zone = inject(NgZone);
  // The API isn't in TypeScript's DOM types yet, hence the loose typing.
  private readonly ctor: any = typeof window === 'undefined'
    ? null
    : (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  private recognition: any = null;

  readonly supported = !!this.ctor;
  readonly listening = signal(false);

  /** Listens for one phrase in `lang` (e.g. ar-EG) and hands it to onText. */
  start(lang: string, onText: (text: string) => void): void {
    if (!this.ctor || this.listening()) return;
    const recognition = new this.ctor();
    this.recognition = recognition;
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => this.zone.run(() => this.listening.set(true));
    recognition.onend = () => this.zone.run(() => this.listening.set(false));
    recognition.onerror = () => this.zone.run(() => this.listening.set(false));
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) this.zone.run(() => onText(transcript.trim()));
    };
    recognition.start();
  }

  stop(): void {
    this.recognition?.stop();
  }
}
