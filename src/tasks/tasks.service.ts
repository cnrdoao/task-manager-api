import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  Audit,
  HandleErrors,
  LogExecution,
  MeasurePerformance,
} from '../common/decorators/aspect.decorators';
import { CreateTaskInput } from './dto/create-task.input';
import { TaskFilterInput } from './dto/task-filter.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';

/**
 * Servicio con la lógica de negocio para la gestión de tareas.
 *
 * Nótese que ningún método contiene código de logging, medición de tiempo
 * ni manejo de errores: esas responsabilidades transversales se inyectan
 * mediante decoradores (AOP), manteniendo la lógica de negocio limpia.
 *
 * @class TasksService
 */
@Injectable()
export class TasksService {
  /**
   * Almacenamiento en memoria de las tareas, indexado por id.
   * @private
   * @type {Map<string, Task>}
   */
  private readonly tasks = new Map<string, Task>();

  /**
   * Recupera todas las tareas, aplicando filtros opcionales.
   *
   * @param {TaskFilterInput} [filter] - Criterios de filtrado.
   * @returns {Task[]} Listado de tareas coincidentes.
   */
  @LogExecution()
  @MeasurePerformance()
  @HandleErrors()
  findAll(filter?: TaskFilterInput): Task[] {
    let result = [...this.tasks.values()];

    if (!filter) {
      return result;
    }

    if (filter.status) {
      result = result.filter((task) => task.status === filter.status);
    }

    if (filter.project) {
      result = result.filter((task) => task.project === filter.project);
    }

    if (filter.assignedUser) {
      result = result.filter((task) => task.assignedUser === filter.assignedUser);
    }

    const { tags } = filter;

    if (tags?.length) {
      result = result.filter((task) =>
        tags.some((tag) => task.tags.includes(tag)),
      );
    }

    return result;
  }

  /**
   * Busca una tarea por su identificador.
   *
   * @param {string} id - Identificador único de la tarea.
   * @returns {Task} La tarea encontrada.
   * @throws {NotFoundException} Si no existe una tarea con ese id.
   */
  @LogExecution()
  @HandleErrors()
  findOne(id: string): Task {
    const task = this.tasks.get(id);

    if (!task) {
      throw new NotFoundException(`No existe una tarea con el id "${id}".`);
    }

    return task;
  }

  /**
   * Crea y persiste una nueva tarea.
   *
   * @param {CreateTaskInput} input - Datos de la tarea a crear.
   * @returns {Task} La tarea recién creada.
   */
  @LogExecution()
  @MeasurePerformance()
  @HandleErrors()
  @Audit('CREATE_TASK')
  create(input: CreateTaskInput): Task {
    const now = new Date();

    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      status: input.status ?? TaskStatus.BACKLOG,
      tags: input.tags ?? [],
      assignedUser: input.assignedUser,
      project: input.project,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(task.id, task);

    return task;
  }

  /**
   * Actualiza los campos suministrados de una tarea existente.
   *
   * @param {UpdateTaskInput} input - Identificador y campos a modificar.
   * @returns {Task} La tarea actualizada.
   * @throws {NotFoundException} Si la tarea no existe.
   */
  @LogExecution()
  @HandleErrors()
  @Audit('UPDATE_TASK')
  update(input: UpdateTaskInput): Task {
    const { id, ...changes } = input;
    const existing = this.findOne(id);

    const definedChanges = Object.fromEntries(
      Object.entries(changes).filter(([, value]) => value !== undefined),
    );

    const updated: Task = {
      ...existing,
      ...definedChanges,
      updatedAt: new Date(),
    };

    this.tasks.set(id, updated);

    return updated;
  }

  /**
   * Cambia únicamente el estado de una tarea.
   *
   * @param {string} id - Identificador de la tarea.
   * @param {TaskStatus} status - Nuevo estado a asignar.
   * @returns {Task} La tarea con el estado actualizado.
   */
  @LogExecution()
  @HandleErrors()
  @Audit('CHANGE_TASK_STATUS')
  changeStatus(id: string, status: TaskStatus): Task {
    const task = this.findOne(id);
    task.status = status;
    task.updatedAt = new Date();

    return task;
  }

  /**
   * Añade etiquetas a una tarea, evitando duplicados.
   *
   * @param {string} id - Identificador de la tarea.
   * @param {string[]} tags - Etiquetas a agregar.
   * @returns {Task} La tarea con las etiquetas actualizadas.
   */
  @LogExecution()
  @HandleErrors()
  @Audit('ADD_TASK_TAGS')
  addTags(id: string, tags: string[]): Task {
    const task = this.findOne(id);
    task.tags = [...new Set([...task.tags, ...tags])];
    task.updatedAt = new Date();

    return task;
  }

  /**
   * Elimina etiquetas específicas de una tarea.
   *
   * @param {string} id - Identificador de la tarea.
   * @param {string[]} tags - Etiquetas a remover.
   * @returns {Task} La tarea con las etiquetas actualizadas.
   */
  @LogExecution()
  @HandleErrors()
  @Audit('REMOVE_TASK_TAGS')
  removeTags(id: string, tags: string[]): Task {
    const task = this.findOne(id);
    task.tags = task.tags.filter((tag) => !tags.includes(tag));
    task.updatedAt = new Date();

    return task;
  }

  /**
   * Reasigna la tarea a un nuevo usuario responsable.
   *
   * @param {string} id - Identificador de la tarea.
   * @param {string} assignedUser - Nuevo usuario responsable.
   * @returns {Task} La tarea reasignada.
   */
  @LogExecution()
  @HandleErrors()
  @Audit('ASSIGN_TASK_USER')
  assignUser(id: string, assignedUser: string): Task {
    const task = this.findOne(id);
    task.assignedUser = assignedUser;
    task.updatedAt = new Date();

    return task;
  }

  /**
   * Elimina permanentemente una tarea.
   *
   * @param {string} id - Identificador de la tarea a eliminar.
   * @returns {boolean} `true` si la eliminación fue exitosa.
   * @throws {NotFoundException} Si la tarea no existe.
   */
  @LogExecution()
  @HandleErrors()
  @Audit('DELETE_TASK')
  remove(id: string): boolean {
    this.findOne(id);

    return this.tasks.delete(id);
  }
}