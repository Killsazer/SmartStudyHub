// File: src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Запускаємо глобальну валідацію DTO пайплайнів (для class-validator)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  app.enableCors(); // <--- Додали CORS!
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
