import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

/**
 * Punto de entrada de la aplicación.
 * Inicializa Nest, sustituye el logger por defecto por Winston
 * y activa la validación global de DTOs.
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>}
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  new Logger('Bootstrap').log(
    `Servidor GraphQL disponible en http://localhost:${port}/graphql`,
  );
}

void bootstrap();
