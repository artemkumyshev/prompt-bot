import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errorCode: string;
  details?: unknown;
}

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const result = this.mapToErrorResponse(exception);
    this.logger.warn(
      `Error: ${result.errorCode} - ${result.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );
    response.status(result.statusCode).json(result);
  }

  private mapToErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          return {
            statusCode: HttpStatus.CONFLICT,
            message: 'Запись с таким значением уже существует',
            errorCode: 'UNIQUE_CONSTRAINT',
            details: { target: exception.meta?.target },
          };
        }
        case 'P2003': {
          return {
            statusCode: HttpStatus.CONFLICT,
            message: 'Ссылка на несуществующую запись',
            errorCode: 'FK_CONSTRAINT',
            details: { field: exception.meta?.field_name },
          };
        }
        case 'P2025': {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Запись не найдена',
            errorCode: 'NOT_FOUND',
          };
        }
        default: {
          return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Ошибка базы данных',
            errorCode: 'DB_ERROR',
            details: { code: exception.code },
          };
        }
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Ошибка валидации данных',
        errorCode: 'VALIDATION_ERROR',
        details: { message: exception.message },
      };
    }

    if (exception && typeof exception === 'object' && 'getStatus' in exception) {
      const httpException = exception as { getStatus: () => number; message: string; getResponse: () => unknown };
      const status = httpException.getStatus();
      const res = httpException.getResponse();
      const message = typeof res === 'object' && res !== null && 'message' in (res as object)
        ? (res as { message: string | string[] }).message
        : httpException.message;
      return {
        statusCode: status,
        message: Array.isArray(message) ? message.join(', ') : message,
        errorCode: status === HttpStatus.BAD_REQUEST ? 'VALIDATION_ERROR' : 'ERROR',
        details: typeof res === 'object' && res !== null && 'error' in (res as object) ? (res as { error?: string }).error : undefined,
      };
    }

    const message = exception instanceof Error ? exception.message : 'Внутренняя ошибка сервера';
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      errorCode: 'INTERNAL_ERROR',
    };
  }
}
