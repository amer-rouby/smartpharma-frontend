import { Injectable, NgZone, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { SalesService } from './sales.service';
import { SmartFeatureSettingsService } from './settings/smart-feature-settings.service';
import { Product } from '../models/product.model';
import { CATALOG_STORE, SALES_STORE, offlineDb } from '../utils/offline-db.util';

export interface QueuedSale {
  clientSaleId: string;
  pharmacyId: number;
  /** The exact request the server gets - it carries clientSaleId and soldAt. */
  request: any;
  total: number;
  createdAt: string;
  state: 'PENDING' | 'FAILED';
  attempts: number;
  /** Why the server refused it (FAILED) - a stable code when there is one. */
  errorCode?: string;
  errorMessage?: string;
}

interface CachedCatalog {
  savedAt: string;
  products: Product[];
}

// Lets the POS keep selling when it can't reach the server. Sales are queued
// on this device (IndexedDB) and sent in order when the connection is back;
// the server de-duplicates by clientSaleId, so a resend after a lost response
// can't record a sale twice. A sale the server refuses (e.g. not enough stock
// left) stays in the queue as FAILED for the pharmacist - it's never dropped.
@Injectable({ providedIn: 'root' })
export class OfflineSalesService {
  private readonly salesService = inject(SalesService);
  private readonly authService = inject(AuthService);
  private readonly featureSettings = inject(SmartFeatureSettingsService);
  private readonly zone = inject(NgZone);

  private static readonly SYNC_INTERVAL_MS = 30_000;
  // Statuses that mean the server looked at this sale and said no.
  private static readonly REFUSED = new Set([400, 404, 409, 422]);

  readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  readonly queue = signal<QueuedSale[]>([]);
  readonly syncing = signal(false);

  readonly enabled = computed(() => this.featureSettings.flags().offlineModeEnabled);
  readonly pendingCount = computed(() => this.queue().filter((s) => s.state === 'PENDING').length);
  readonly failed = computed(() => this.queue().filter((s) => s.state === 'FAILED'));

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => this.zone.run(() => {
      this.online.set(true);
      void this.sync();
    }));
    window.addEventListener('offline', () => this.zone.run(() => this.online.set(false)));
    this.zone.runOutsideAngular(() =>
      setInterval(() => this.zone.run(() => void this.sync()), OfflineSalesService.SYNC_INTERVAL_MS));
    void this.refresh().then(() => this.sync());
  }

  newClientSaleId(): string {
    return crypto.randomUUID();
  }

  // --- catalog -------------------------------------------------------------

  cacheCatalog(products: Product[]): void {
    const pharmacyId = this.authService.getPharmacyId();
    if (!pharmacyId) return;
    const value: CachedCatalog = { savedAt: new Date().toISOString(), products };
    offlineDb.put(CATALOG_STORE, value, `products-${pharmacyId}`).catch(() => undefined);
  }

  async cachedCatalog(): Promise<CachedCatalog | undefined> {
    const pharmacyId = this.authService.getPharmacyId();
    if (!pharmacyId) return undefined;
    return offlineDb.get<CachedCatalog>(CATALOG_STORE, `products-${pharmacyId}`).catch(() => undefined);
  }

  // --- queue ---------------------------------------------------------------

  async enqueue(request: any, total: number): Promise<void> {
    const sale: QueuedSale = {
      clientSaleId: request.clientSaleId,
      pharmacyId: this.authService.getPharmacyId() ?? request.pharmacyId,
      request,
      total,
      createdAt: new Date().toISOString(),
      state: 'PENDING',
      attempts: 0
    };
    await offlineDb.put(SALES_STORE, sale);
    await this.refresh();
  }

  async retry(clientSaleId: string): Promise<void> {
    const sale = this.queue().find((s) => s.clientSaleId === clientSaleId);
    if (!sale) return;
    await offlineDb.put(SALES_STORE, { ...sale, state: 'PENDING', errorCode: undefined, errorMessage: undefined });
    await this.refresh();
    await this.sync();
  }

  async discard(clientSaleId: string): Promise<void> {
    await offlineDb.delete(SALES_STORE, clientSaleId);
    await this.refresh();
  }

  // Sends pending sales oldest first. Stops at the first network failure (the
  // server is still unreachable - later sales would fail the same way).
  async sync(): Promise<void> {
    if (this.syncing() || !this.online()) return;
    const pharmacyId = this.authService.getPharmacyId();
    if (!pharmacyId) return;
    this.syncing.set(true);
    try {
      const pending = this.queue()
        .filter((s) => s.state === 'PENDING' && s.pharmacyId === pharmacyId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      for (const sale of pending) {
        try {
          await firstValueFrom(this.salesService.createSale(sale.request));
          await offlineDb.delete(SALES_STORE, sale.clientSaleId);
        } catch (error: any) {
          const status: number = error?.status ?? 0;
          if (status === 0) {
            // Never reached the server: still offline.
            this.online.set(false);
            break;
          }
          if (!OfflineSalesService.REFUSED.has(status)) {
            // 401/403 (session expired) or 5xx (server trouble) say nothing
            // about the sale itself - keep it pending and try again later.
            break;
          }
          await offlineDb.put(SALES_STORE, {
            ...sale,
            state: 'FAILED',
            attempts: sale.attempts + 1,
            errorCode: error.code,
            errorMessage: error.message
          } satisfies QueuedSale);
        }
      }
    } finally {
      this.syncing.set(false);
      await this.refresh();
    }
  }

  private async refresh(): Promise<void> {
    try {
      this.queue.set(await offlineDb.getAll<QueuedSale>(SALES_STORE));
    } catch {
      this.queue.set([]);
    }
  }
}
