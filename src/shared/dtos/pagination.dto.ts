export class PaginationDto {
    page?: number = 1;
    limit?: number = 10;
    sortBy?: string = 'createdAt';
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
  }