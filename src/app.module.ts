import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { join } from 'path';
import { GraphQLLoggingInterceptor } from './common/aspects/logging.aspect';
import { winstonConfig } from './common/logger/logger.config';
import { TasksModule } from './tasks/tasks.module';

/**
 * Módulo raíz de la aplicación.
 * Configura GraphQL (code-first), el logger Winston y registra
 * el interceptor de logging de forma global.
 *
 * @class AppModule
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(winstonConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    TasksModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: GraphQLLoggingInterceptor,
    },
  ],
})
export class AppModule {}