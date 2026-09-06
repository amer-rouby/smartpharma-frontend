import { Observable } from 'rxjs';
import { PagedResult } from '../classes/paged-result';

export interface CrudServiceContract<Model, PrimaryKeyType = number> {
  create(model: Model): Observable<Model>;
  update(model: Model): Observable<Model>;
  delete(id: PrimaryKeyType): Observable<void>;
  getById(id: PrimaryKeyType): Observable<Model>;
  getAll(options?: Record<string, unknown>): Observable<PagedResult<Model>>;
}
