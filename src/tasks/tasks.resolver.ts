import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateTaskInput } from './dto/create-task.input';
import { TaskFilterInput } from './dto/task-filter.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';
import { TasksService } from './tasks.service';

/**
 * Resolver GraphQL que expone las operaciones sobre tareas.
 * Actúa como capa delgada: delega toda la lógica al {@link TasksService}.
 *
 * @class TasksResolver
 */
@Resolver(() => Task)
export class TasksResolver {
  /**
   * @param {TasksService} tasksService - Servicio de gestión de tareas.
   */
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Consulta el listado de tareas con filtros opcionales.
   *
   * @param {TaskFilterInput} [filter] - Criterios de filtrado.
   * @returns {Task[]} Tareas coincidentes.
   */
  @Query(() => [Task], {
    name: 'tasks',
    description: 'Lista todas las tareas, con filtros opcionales.',
  })
  findAll(
    @Args('filter', { nullable: true }) filter?: TaskFilterInput,
  ): Task[] {
    return this.tasksService.findAll(filter);
  }

  /**
   * Consulta una tarea puntual por su identificador.
   *
   * @param {string} id - Identificador de la tarea.
   * @returns {Task} La tarea solicitada.
   */
  @Query(() => Task, {
    name: 'task',
    description: 'Obtiene una tarea por su identificador.',
  })
  findOne(@Args('id', { type: () => ID }) id: string): Task {
    return this.tasksService.findOne(id);
  }

  /**
   * Crea una nueva tarea.
   *
   * @param {CreateTaskInput} input - Datos de la tarea.
   * @returns {Task} La tarea creada.
   */
  @Mutation(() => Task, { description: 'Crea una nueva tarea.' })
  createTask(@Args('input') input: CreateTaskInput): Task {
    return this.tasksService.create(input);
  }

  /**
   * Actualiza los datos de una tarea existente.
   *
   * @param {UpdateTaskInput} input - Campos a modificar.
   * @returns {Task} La tarea actualizada.
   */
  @Mutation(() => Task, { description: 'Edita una tarea existente.' })
  updateTask(@Args('input') input: UpdateTaskInput): Task {
    return this.tasksService.update(input);
  }

  /**
   * Cambia el estado de una tarea.
   *
   * @param {string} id - Identificador de la tarea.
   * @param {TaskStatus} status - Nuevo estado.
   * @returns {Task} La tarea actualizada.
   */
  @Mutation(() => Task, { description: 'Cambia el estado de una tarea.' })
  changeTaskStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => TaskStatus }) status: TaskStatus,
  ): Task {
    return this.tasksService.changeStatus(id, status);
  }

  /**
   * Agrega etiquetas a una tarea.
   *
   * @param {string} id - Identificador de la tarea.
   * @param {string[]} tags - Etiquetas a añadir.
   * @returns {Task} La tarea actualizada.
   */
  @Mutation(() => Task, { description: 'Agrega etiquetas a una tarea.' })
  addTaskTags(
    @Args('id', { type: () => ID }) id: string,
    @Args('tags', { type: () => [String] }) tags: string[],
  ): Task {
    return this.tasksService.addTags(id, tags);
  }

  /**
   * Remueve etiquetas de una tarea.
   *
   * @param {string} id - Identificador de la tarea.
   * @param {string[]} tags - Etiquetas a remover.
   * @returns {Task} La tarea actualizada.
   */
  @Mutation(() => Task, { description: 'Remueve etiquetas de una tarea.' })
  removeTaskTags(
    @Args('id', { type: () => ID }) id: string,
    @Args('tags', { type: () => [String] }) tags: string[],
  ): Task {
    return this.tasksService.removeTags(id, tags);
  }

  /**
   * Reasigna una tarea a otro usuario.
   *
   * @param {string} id - Identificador de la tarea.
   * @param {string} assignedUser - Nuevo responsable.
   * @returns {Task} La tarea actualizada.
   */
  @Mutation(() => Task, { description: 'Reasigna el responsable de una tarea.' })
  assignTaskUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('assignedUser') assignedUser: string,
  ): Task {
    return this.tasksService.assignUser(id, assignedUser);
  }

  /**
   * Elimina una tarea del sistema.
   *
   * @param {string} id - Identificador de la tarea.
   * @returns {boolean} `true` si se eliminó correctamente.
   */
  @Mutation(() => Boolean, { description: 'Elimina una tarea.' })
  removeTask(@Args('id', { type: () => ID }) id: string): boolean {
    return this.tasksService.remove(id);
  }
}