export interface ExternalApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: Date;
  }