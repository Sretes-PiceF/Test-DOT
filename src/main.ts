import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- Pastikan ini diimpor

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Tambahkan ini:
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Opsional: Hapus properti asing
    transform: true, // Opsional: Mengubah tipe payload menjadi tipe DTO
  }));
  await app.listen(3001);
}
bootstrap();