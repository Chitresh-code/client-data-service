import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

const SERVER_ERROR_THRESHOLD = 500;

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (status >= SERVER_ERROR_THRESHOLD) {
      this.logger.error(
        { err: exception, path: request.url },
        'unhandled error',
      );
    }

    response
      .status(status)
      .json(
        typeof body === 'string'
          ? { statusCode: status, message: body, path: request.url }
          : { statusCode: status, ...body, path: request.url },
      );
  }
}
