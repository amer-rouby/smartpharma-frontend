import { Injectable, Type } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CastResponseContainer } from 'cast-response';
import { CrudWithDialogService, PagedResult, RegisterServiceMixin } from '../../../core/crud';
import { environment } from '../../../../environments/environment';
import { UserModel } from '../models/user.model';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

interface UsersListResponse {
  data: unknown[];
}

// Backend has no paginated /users endpoint - list/search both return the full
// matching array, so pagination happens client-side here, same as the
// pre-existing UsersComponent did before this migration.
@CastResponseContainer({
  $default: {
    model: () => UserModel,
  },
})
@Injectable({ providedIn: 'root' })
export class UserCrudService extends RegisterServiceMixin(CrudWithDialogService)<UserModel, UserDialogComponent, number> {
  $$serviceName = 'UserCrudService';

  override getSegmentUrl(): string {
    return `${environment.apiUrl}/users`;
  }

  override getDialogComponent(): Type<UserDialogComponent> {
    return UserDialogComponent;
  }

  override getModelInstance(): UserModel {
    const model = new UserModel();
    model.pharmacyId = this.getPharmacyId();
    return model;
  }

  override toRequestPayload(model: UserModel): unknown {
    const { username, fullName, email, phone, role, pharmacyId, isActive, password } = model;
    return {
      username,
      fullName,
      email,
      phone,
      role,
      pharmacyId,
      isActive,
      ...(password?.trim() ? { password } : {}),
    };
  }

  override getAll(options?: Record<string, unknown>): Observable<PagedResult<UserModel>> {
    const search = (options?.['search'] as string | undefined)?.trim();
    const page = Number(options?.['page'] ?? 0);
    const size = Number(options?.['size'] ?? 10);

    let params = new HttpParams().set('pharmacyId', this.getPharmacyId());
    const url = search ? `${this.getSegmentUrl()}/search` : this.getSegmentUrl();
    if (search) {
      params = params.set('query', search);
    }

    return this.http.get<UsersListResponse>(url, { params }).pipe(
      map((res) => {
        const all = (res.data ?? []).map((item) => Object.assign(new UserModel(), item));
        const start = page * size;
        const content = all.slice(start, start + size);

        const result = new PagedResult<UserModel>();
        result.content = content;
        result.totalElements = all.length;
        result.totalPages = Math.max(1, Math.ceil(all.length / size));
        result.size = size;
        result.number = page;
        result.first = page === 0;
        result.last = start + size >= all.length;
        result.empty = content.length === 0;
        return result;
      }),
    );
  }
}
