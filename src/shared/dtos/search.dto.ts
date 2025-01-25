import { PaginationDto } from "./pagination.dto";

export class SearchDto extends PaginationDto {
    searchTerm?: string;
    filters?: Record<string, any>;
}