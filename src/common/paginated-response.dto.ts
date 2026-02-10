export class PaginationMetaDto {
  page: number;
  pageSize: number;
  total: number;
}

export class PaginatedResponseDto<T> {
  items: T[];
  meta: PaginationMetaDto;

  constructor(items: T[], page: number, pageSize: number, total: number) {
    this.items = items;
    this.meta = { page, pageSize, total };
  }
}
