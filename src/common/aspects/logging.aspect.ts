import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, tap } from 'rxjs';

/**
 * Interceptor que aplica el aspecto de logging de forma transversal
 * a todas las operaciones GraphQL, sin acoplar la lógica de negocio.
 *
 * @class GraphQLLoggingInterceptor
 * @implements {NestInterceptor}
 */
@Injectable()
export class GraphQLLoggingInterceptor implements NestInterceptor {
  /** @private */
  private readonly logger = new Logger(GraphQLLoggingInterceptor.name);

  /**
   * Intercepta la petición GraphQL, registra la operación entrante
   * y el tiempo total de resolución.
   *
   * @param {ExecutionContext} context - Contexto de ejecución de Nest.
   * @param {CallHandler} next - Manejador que continúa la cadena.
   * @returns {Observable<unknown>} Flujo de la respuesta.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const operation = `${info.parentType.name}.${info.fieldName}`;
    const start = Date.now();

    this.logger.log(`▶ Petición GraphQL: ${operation}`);

    return next.handle().pipe(
      tap({
        next: () =>
          this.logger.log(`◀ ${operation} resuelto en ${Date.now() - start}ms`),
        error: (error: Error) =>
          this.logger.error(
            `◀ ${operation} falló en ${Date.now() - start}ms: ${error.message}`,
          ),
      }),
    );
  }
}