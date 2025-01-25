export interface WebhookPayload {
    event: string;
    data: any;
    timestamp: Date;
  }