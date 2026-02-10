import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Prompt Catalog API')
    .setDescription('API каталога промптов: Department, Role, Prompt')
    .setVersion('1.0')
    .addTag('departments', 'Отделы')
    .addTag('roles', 'Роли')
    .addTag('prompts', 'Промпты')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(process.env.SWAGGER_PATH ?? 'api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
