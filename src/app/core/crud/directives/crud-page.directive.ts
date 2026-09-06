import { Directive, WritableSignal, Signal, computed, effect, inject, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, delay, distinctUntilChanged, forkJoin, of } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { CrudServiceContract } from '../interfaces/crud-service-contract.interface';
import { PagedResult } from '../classes/paged-result';

export interface CrudPageConfig {
  debounceTime?: number;
  defaultPageSize?: number;
  skeletonRowCount?: number;
  minLoadingDuration?: number;
}

export interface CrudPageContract<TModel> {
  readonly pageIndex: WritableSignal<number>;
  readonly pageSize: WritableSignal<number>;
  readonly searchQuery: WritableSignal<string>;
  readonly loading: WritableSignal<boolean>;
  readonly result: WritableSignal<PagedResult<TModel> | null>;
  readonly models: Signal<TModel[]>;
  readonly totalElements: Signal<number>;
  readonly skeletonRows: number[];
  onPageChange(event: PageEvent): void;
  onSearchInput(query: string): void;
  refresh(): void;
}

const DEFAULT_CONFIG: Required<CrudPageConfig> = {
  debounceTime: 350,
  defaultPageSize: 10,
  skeletonRowCount: 5,
  minLoadingDuration: 0,
};

@Directive()
export abstract class CrudPageDirective<TModel, TService extends CrudServiceContract<TModel, unknown>> implements CrudPageContract<TModel> {
  protected readonly errorHandler = inject(ErrorHandlerService);

  abstract readonly service: TService;

  readonly pageIndex = signal(0);
  readonly pageSize: WritableSignal<number>;
  readonly searchQuery = signal('');
  readonly loading = signal(false);
  readonly result = signal<PagedResult<TModel> | null>(null);

  readonly models: Signal<TModel[]>;
  readonly totalElements: Signal<number>;
  readonly skeletonRows: number[];

  private readonly debouncedSearch: Signal<string>;
  private readonly cfg: Required<CrudPageConfig>;

  protected getConfig(): CrudPageConfig {
    return {};
  }

  constructor() {
    const cfg = (this.cfg = { ...DEFAULT_CONFIG, ...this.getConfig() });

    this.pageSize = signal(cfg.defaultPageSize);
    this.models = computed(() => this.result()?.content ?? []);
    this.totalElements = computed(() => this.result()?.totalElements ?? 0);
    this.skeletonRows = Array.from({ length: cfg.skeletonRowCount }, (_, i) => i);

    this.debouncedSearch = toSignal(
      toObservable(this.searchQuery).pipe(debounceTime(cfg.debounceTime), distinctUntilChanged()),
      { initialValue: '' },
    );

    effect(() => {
      const page = this.pageIndex();
      const size = this.pageSize();
      const search = this.debouncedSearch();
      untracked(() => this.loadData(page, size, search));
    });
  }

  protected buildLoadOptions(page: number, size: number, search: string): Record<string, unknown> {
    const options: Record<string, unknown> = { page, size };
    if (search) options['search'] = search;
    return options;
  }

  private loadData(page: number, size: number, search: string) {
    this.loading.set(true);
    const options = this.buildLoadOptions(page, size, search);
    const data$ = this.service.getAll(options);
    const minDelay$ = of(null).pipe(delay(this.cfg.minLoadingDuration));

    forkJoin([data$, minDelay$]).subscribe({
      next: ([result]) => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorHandler.handleHttpError(err, 'COMMON.LOAD_ERROR');
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSearchInput(query: string) {
    this.searchQuery.set(query);
    this.pageIndex.set(0);
  }

  refresh() {
    this.loadData(this.pageIndex(), this.pageSize(), this.debouncedSearch());
  }
}
