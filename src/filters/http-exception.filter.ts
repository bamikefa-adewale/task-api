import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        exceptionResponse &&
        typeof exceptionResponse === 'object' &&
        'message' in (exceptionResponse as any)
      ) {
        const m = (exceptionResponse as any).message;
        message = Array.isArray(m) ? m : m ?? exception.message;
      } else {
        message = exception.message;
      }

      // Normalize message to array for validation errors, keep string otherwise
      if (Array.isArray(message) && message.length === 1) {
        message = message[0];
      }
    }

    response.status(status).json({
      success: false,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
