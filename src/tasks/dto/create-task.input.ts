import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

/**
 * Datos requeridos para crear una nueva tarea.
 *
 * @class CreateTaskInput
 */
@InputType({ description: 'Payload para la creación de una tarea.' })
export class CreateTaskInput {
  @Field({ description: 'Título de la tarea (3-120 caracteres).' })
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  @MaxLength(120, { message: 'El título no puede exceder 120 caracteres.' })
  title: string;

  @Field({ description: 'Descripción detallada de la tarea.' })
  @IsString()
  @MaxLength(2000)
  description: string;

  @Field(() => TaskStatus, {
    nullable: true,
    defaultValue: TaskStatus.BACKLOG,
    description: 'Estado inicial. Por defecto BACKLOG.',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => [String], {
    nullable: true,
    defaultValue: [],
    description: 'Etiquetas de clasificación.',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(15)
  tags?: string[];

  @Field({ description: 'Usuario responsable de la tarea.' })
  @IsString()
  @MinLength(1)
  assignedUser: string;

  @Field({ description: 'Proyecto al que pertenece la tarea.' })
  @IsString()
  @MinLength(1)
  project: string;
}