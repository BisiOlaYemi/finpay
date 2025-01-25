import { ValidationPipe } from '@nestjs/common';

export const validationConfig = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true
});