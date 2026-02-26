import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(code: number, message: string, data: unknown = null) {
    super(
      {
        code,
        data,
        message,
      },
      HttpStatus.OK,
    );
  }
}
