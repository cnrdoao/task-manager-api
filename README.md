# Task Manager API

API GraphQL construida con NestJS para la gestión de tareas de proyectos de desarrollo de software.

**Autor:** Andrés Conrado

## Temas aplicados

### Programación Orientada a Aspectos (AOP)

Las responsabilidades transversales están completamente separadas de la lógica de negocio:

| Aspecto | Ubicación | Responsabilidad |
|---|---|---|
| `LogExecution` | `src/common/decorators/aspect.decorators.ts` | Registra invocación, argumentos y resultado (advices *before* y *after returning*) |
| `MeasurePerformance` | `src/common/decorators/aspect.decorators.ts` | Mide tiempo de ejecución y alerta al superar el umbral (advice *around*) |
| `HandleErrors` | `src/common/decorators/aspect.decorators.ts` | Captura, registra y repropaga excepciones (advice *after throwing*) |
| `Audit` | `src/common/decorators/aspect.decorators.ts` | Deja traza de auditoría de toda operación que muta estado |
| `GraphQLLoggingInterceptor` | `src/common/aspects/logging.aspect.ts` | Aspecto global sobre todas las operaciones GraphQL |

`TasksService` no contiene una sola línea de logging, medición ni manejo de errores: esos comportamientos se tejen mediante decoradores, cumpliendo la separación de incumbencias.

### Clean Code

- Separación por capas: resolver (transporte) → servicio (negocio) → entidad (dominio)
- Funciones cortas con responsabilidad única
- Nombres descriptivos en español para el dominio, inglés para la infraestructura
- DTOs con validación declarativa vía `class-validator`
- Sin números mágicos ni código duplicado

### Logging

Winston con tres transportes: consola coloreada para desarrollo, `logs/error.log` para errores y `logs/combined.log` para el histórico completo. Rotación automática a los 5 MB.

### GitFlow

Ramas `main`, `develop`, `feature/*` y `release/*`, con merges `--no-ff` para preservar la trazabilidad del historial.

## Modelo de datos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `ID` | Identificador único (UUID v4) |
| `title` | `String` | Título de la tarea |
| `description` | `String` | Descripción detallada |
| `status` | `TaskStatus` | `BACKLOG`, `TODO`, `IN_PROGRESS`, `DONE` |
| `tags` | `[String]` | Arreglo dinámico de etiquetas |
| `createdAt` | `Date` | Fecha de creación |
| `updatedAt` | `Date` | Fecha de última modificación |
| `assignedUser` | `String` | Usuario responsable |
| `project` | `String` | Proyecto al que pertenece |

## Instalación

```bash
npm install
cp .env.example .env
npm run start:dev
```

Playground disponible en http://localhost:3000/graphql

## Operaciones

### Queries

```graphql
query { tasks { id title status assignedUser project } }

query { tasks(filter: { status: IN_PROGRESS, project: "task-manager" }) { id title } }

query { task(id: "uuid") { id title description tags } }
```

### Mutations

```graphql
mutation {
  createTask(input: {
    title: "Implementar autenticación JWT"
    description: "Agregar guard y estrategia Passport"
    tags: ["backend", "seguridad"]
    assignedUser: "aconrado"
    project: "task-manager"
  }) { id title status createdAt }
}

mutation { updateTask(input: { id: "uuid", title: "Nuevo título" }) { id title } }

mutation { changeTaskStatus(id: "uuid", status: IN_PROGRESS) { id status } }

mutation { addTaskTags(id: "uuid", tags: ["urgente"]) { id tags } }

mutation { removeTaskTags(id: "uuid", tags: ["backend"]) { id tags } }

mutation { assignTaskUser(id: "uuid", assignedUser: "otrousuario") { id assignedUser } }

mutation { removeTask(id: "uuid") }
```

## Stack

NestJS · GraphQL (Apollo, code-first) · TypeScript · Winston · class-validator