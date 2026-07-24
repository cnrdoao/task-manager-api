import { Logger } from '@nestjs/common';

/**
 * Logger dedicado para los aspectos transversales.
 * @private
 */
const aspectLogger = new Logger('AspectWeaver');

/**
 * Serializa argumentos de forma segura para logging, evitando
 * referencias circulares y truncando cargas muy grandes.
 *
 * @param {unknown} value - Valor a serializar.
 * @returns {string} Representación en texto del valor.
 */
function safeStringify(value: unknown): string {
  try {
    const serialized = JSON.stringify(value);
    return serialized && serialized.length > 500
      ? `${serialized.slice(0, 500)}...[truncated]`
      : serialized ?? 'undefined';
  } catch {
    return '[unserializable]';
  }
}

/**
 * ASPECTO: Logging.
 * Registra la invocación de un método, sus argumentos y su resultado.
 * Implementa los advices "before" y "after returning".
 *
 * @param {string} [context] - Nombre del contexto a mostrar en el log.
 * @returns {MethodDecorator} Decorador que teje el aspecto sobre el método.
 *
 * @example
 * @LogExecution('TasksService')
 * findAll() { ... }
 */
export function LogExecution(context?: string): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value;
    const scope = context ?? target.constructor.name;

    descriptor.value = function (...args: unknown[]) {
      aspectLogger.log(
        `→ ${String(propertyKey)}() invocado | args: ${safeStringify(args)}`,
        scope,
      );

      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.then((resolved: unknown) => {
          aspectLogger.log(
            `← ${String(propertyKey)}() finalizado | result: ${safeStringify(resolved)}`,
            scope,
          );
          return resolved;
        });
      }

      aspectLogger.log(
        `← ${String(propertyKey)}() finalizado | result: ${safeStringify(result)}`,
        scope,
      );

      return result;
    };

    return descriptor;
  };
}

/**
 * ASPECTO: Medición de rendimiento.
 * Calcula el tiempo de ejecución de un método y emite una advertencia
 * si supera el umbral configurado.
 *
 * @param {number} [thresholdMs=200] - Umbral en milisegundos para alertar.
 * @returns {MethodDecorator} Decorador que teje el aspecto sobre el método.
 */
export function MeasurePerformance(thresholdMs = 200): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value;
    const scope = target.constructor.name;

    descriptor.value = function (...args: unknown[]) {
      const start = process.hrtime.bigint();

      /**
       * Emite la métrica de duración una vez concluida la ejecución.
       * @param {bigint} startedAt - Marca de inicio en nanosegundos.
       */
      const report = (startedAt: bigint): void => {
        const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        const message = `⏱ ${String(propertyKey)}() ejecutado en ${elapsedMs.toFixed(2)}ms`;

        if (elapsedMs > thresholdMs) {
          aspectLogger.warn(`${message} (excede umbral de ${thresholdMs}ms)`, scope);
        } else {
          aspectLogger.debug(message, scope);
        }
      };

      try {
        const result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result.finally(() => report(start));
        }

        report(start);
        return result;
      } catch (error) {
        report(start);
        throw error;
      }
    };
    return descriptor;
  };
}

/**
 * ASPECTO: Manejo de errores.
 * Intercepta excepciones lanzadas por el método, las registra con su
 * stack trace y las vuelve a propagar. Implementa el advice "after throwing".
 *
 * @returns {MethodDecorator} Decorador que teje el aspecto sobre el método.
 */
export function HandleErrors(): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value;
    const scope = target.constructor.name;

    descriptor.value = function (...args: unknown[]) {
      /**
       * Registra la excepción capturada con su traza.
       * @param {unknown} error - Excepción interceptada.
       */
      const logError = (error: unknown): void => {
        const err = error as Error;
        aspectLogger.error(
          `✖ Error en ${String(propertyKey)}(): ${err.message} | args: ${safeStringify(args)}`,
          err.stack,
          scope,
        );
      };

      try {
        const result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result.catch((error: unknown) => {
            logError(error);
            throw error;
          });
        }

        return result;
      } catch (error) {
        logError(error);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * ASPECTO: Auditoría.
 * Registra en un canal separado toda operación que muta el estado del sistema,
 * dejando trazabilidad de creaciones, ediciones y eliminaciones.
 *
 * @param {string} action - Nombre de la acción auditada (ej. 'CREATE_TASK').
 * @returns {MethodDecorator} Decorador que teje el aspecto sobre el método.
 */
export function Audit(action: string): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value;
    const auditLogger = new Logger('AuditTrail');

    descriptor.value = function (...args: unknown[]) {
      const result = originalMethod.apply(this, args);

      /** Registra la traza de auditoría de la operación. */
      const trace = (): void => {
        auditLogger.log(
          `[${action}] ${new Date().toISOString()} | payload: ${safeStringify(args)}`,
        );
      };

      if (result instanceof Promise) {
        return result.then((resolved: unknown) => {
          trace();
          return resolved;
        });
      }

      trace();
      return result;
    };
    return descriptor;
  };
}