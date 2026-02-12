import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';

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

  const config = new DocumentBuilder()
    .setTitle('Prompt Catalog API')
    .setDescription('API каталога промптов: Department, Role, Prompt')
    .setVersion('1.0')
    .addTag('departments', 'Отделы')
    .addTag('roles', 'Роли')
    .addTag('prompts', 'Промпты')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });

  const port = Number(process.env.PORT ?? 8000);
  await app.listen(port);
}

void bootstrap();