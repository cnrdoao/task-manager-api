import { Module } from '@nestjs/common';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';

/**
 * Módulo que agrupa el dominio de gestión de tareas.
 *
 * @class TasksModule
 */
@Module({
  providers: [TasksResolver, TasksService],
  exports: [TasksService],
})
export class TasksModule {}