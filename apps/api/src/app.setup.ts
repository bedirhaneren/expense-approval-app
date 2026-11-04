import { INestApplication, ValidationPipe } from '@nestjs/common';

/** App-wide configuration shared by main.ts and the e2e tests. */
export function configureApp(app: INestApplication): void {
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
