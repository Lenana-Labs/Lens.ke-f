// DRF PageNumberPagination default response shape
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// DRF validation error response — field-level errors
export interface ApiError {
  detail?: string;
  [field: string]: string | string[] | undefined;
}
