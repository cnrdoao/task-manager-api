import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { CreateTaskInput } from './create-task.input';

/**
 * Datos para la actualización parcial de una tarea existente.
 * Hereda todos los campos de {@link CreateTaskInput} como opcionales.
 *
 * @class UpdateTaskInput
 * @extends {PartialType(CreateTaskInput)}
 */
@InputType({ description: 'Payload para la edición de una tarea.' })
export class UpdateTaskInput extends PartialType(CreateTaskInput) {
  @Field(() => ID, { description: 'Identificador de la tarea a modificar.' })
  @IsUUID('4', { message: 'El id debe ser un UUID v4 válido.' })
  id: string;
}