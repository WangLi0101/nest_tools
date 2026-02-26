import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCode } from '../exceptions/error-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof BusinessException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const code =
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'code' in exceptionResponse
          ? Number(exceptionResponse.code) || status
          : status;
      const data =
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'data' in exceptionResponse
          ? exceptionResponse.data
          : null;
      response.status(status).json({
        code,
        data,
        message: this.pickMessage(exceptionResponse),
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const dtoErrors = this.pickDtoMessages(status, exceptionResponse);

      if (dtoErrors.length > 0) {
        response.status(status).json({
          code: ErrorCode.VALIDATION_ERROR,
          data: dtoErrors,
          message: dtoErrors.join(', '),
        });
        return;
      }

      response.status(status).json({
        code: status,
        data: null,
        message: this.pickMessage(exceptionResponse),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      data: null,
      message: 'Internal server error',
    });
  }

  private pickMessage(exceptionResponse: string | object): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const message = exceptionResponse.message;
      if (Array.isArray(message)) {
        return message.join(', ');
      }
      if (typeof message === 'string') {
        return message;
      }
    }

    return 'Request failed';
  }

  private pickDtoMessages(
    status: number,
    exceptionResponse: string | object,
  ): string[] {
    if (status !== HttpStatus.BAD_REQUEST) {
      return [];
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const message = exceptionResponse.message;
      if (Array.isArray(message)) {
        return message.filter(
          (item): item is string => typeof item === 'string',
        );
      }
    }

    return [];
  }
}
