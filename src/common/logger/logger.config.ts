import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

/**
 * Configuración centralizada del logger Winston.
 * Define transportes para consola (desarrollo) y archivos (persistencia).
 *
 * @constant
 * @type {WinstonModuleOptions}
 */
export const winstonConfig: WinstonModuleOptions = {
  levels: winston.config.npm.levels,
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `[${timestamp}] ${level} [${context ?? 'App'}] ${message}${metaString}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5_242_880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5_242_880,
      maxFiles: 5,
    }),
  ],
};