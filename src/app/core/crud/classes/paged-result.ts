// Mirrors the backend's Spring Data Page shape (see PaginatedResponse in
// core/models/api-response.model.ts) so existing endpoints don't need to change.
export class PagedResult<T> {
  content: T[] = [];
  totalElements = 0;
  totalPages = 0;
  size = 0;
  number = 0;
  first = true;
  last = true;
  empty = true;
}
