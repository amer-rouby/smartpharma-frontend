export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  // Stable machine-readable error code (e.g. "INSUFFICIENT_STOCK") set only on
  // error responses that have been migrated to the backend's LocalizedException -
  // ErrorHandlerService resolves it to ERRORS.<code> in ar.json/en.json instead of
  // showing `message` (English). Absent on success and on any not-yet-migrated error.
  code?: string;
  params?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
