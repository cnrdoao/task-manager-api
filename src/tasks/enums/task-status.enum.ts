import { registerEnumType } from '@nestjs/graphql';

/**
 * Estados posibles del ciclo de vida de una tarea.
 *
 * @enum {string}
 */
export enum TaskStatus {
  /** Tarea registrada pero aún no planificada. */
  BACKLOG = 'BACKLOG',
  /** Tarea planificada y lista para comenzar. */
  TODO = 'TODO',
  /** Tarea actualmente en desarrollo. */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Tarea completada. */
  DONE = 'DONE',
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Estados válidos del ciclo de vida de una tarea.',
});