import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || res;
        errorName = (res as any).error || exception.name;
      } else {
        message = res;
        errorName = exception.name;
      }
    } else if (typeof exception === 'object' && exception !== null) {
      const err = exception as any;

      // MongoDB duplicate key error (E11000)
      if (err.code === 11000) {
        status = HttpStatus.CONFLICT;
        errorName = 'ConflictError';
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        message = `A resource with this ${field} already exists.`;
      }
      // Mongoose CastError (invalid ObjectId)
      else if (err.name === 'CastError') {
        status = HttpStatus.BAD_REQUEST;
        errorName = 'CastError';
        message = `Invalid identifier format for ${err.path}: ${err.value}`;
      }
      // Mongoose ValidationError
      else if (err.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        errorName = 'ValidationError';
        message = Object.values(err.errors || {}).map((e: any) => e.message);
      } else {
        this.logger.error(
          `Unhandled exception occurred: ${err.message || err}`,
          err.stack,
        );
      }
    }

    response.status(status).json({
      statusCode: status,
      error: errorName,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
