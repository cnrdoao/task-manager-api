import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

/**
 * Criterios opcionales para filtrar el listado de tareas.
 *
 * @class TaskFilterInput
 */
@InputType({ description: 'Filtros para la consulta de tareas.' })
export class TaskFilterInput {
  @Field(() => TaskStatus, { nullable: true, description: 'Filtrar por estado.' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field({ nullable: true, description: 'Filtrar por proyecto.' })
  @IsOptional()
  @IsString()
  project?: string;

  @Field({ nullable: true, description: 'Filtrar por usuario asignado.' })
  @IsOptional()
  @IsString()
  assignedUser?: string;

  @Field(() => [String], {
    nullable: true,
    description: 'Filtrar por etiquetas (coincidencia parcial).',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}