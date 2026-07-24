import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TaskStatus } from '../enums/task-status.enum';

/**
 * Representa una tarea dentro de un proyecto de desarrollo de software.
 *
 * @class Task
 */
@ObjectType({ description: 'Tarea de un proyecto de desarrollo de software.' })
export class Task {
  /** Identificador único (UUID v4). */
  @Field(() => ID, { description: 'Identificador único de la tarea.' })
  id: string;

  /** Título breve y descriptivo. */
  @Field({ description: 'Título de la tarea.' })
  title: string;

  /** Descripción detallada del trabajo a realizar. */
  @Field({ description: 'Descripción detallada de la tarea.' })
  description: string;

  /** Estado actual dentro del flujo de trabajo. */
  @Field(() => TaskStatus, { description: 'Estado actual de la tarea.' })
  status: TaskStatus;

  /** Arreglo dinámico de etiquetas de clasificación. */
  @Field(() => [String], { description: 'Etiquetas asociadas a la tarea.' })
  tags: string[];

  /** Marca temporal de creación del registro. */
  @Field(() => Date, { description: 'Fecha de creación de la tarea.' })
  createdAt: Date;

  /** Marca temporal de la última modificación. */
  @Field(() => Date, { description: 'Fecha de última actualización.' })
  updatedAt: Date;

  /** Usuario responsable de ejecutar la tarea. */
  @Field({ description: 'Usuario asignado como responsable.' })
  assignedUser: string;

  /** Proyecto contenedor de la tarea. */
  @Field({ description: 'Proyecto al que pertenece la tarea.' })
  project: string;
}