export type PaginatedResponse<T> = {
  values: T[];
  page: number;
  size: number;
  pagelen: number;
  next?: string;
};

export type PaginationParams = {
  page?: number;
  pagelen?: number;
};
