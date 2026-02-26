import { BusinessException } from './business.exception';
import { ErrorCode } from './error-codes';

export class ValidationBusinessException extends BusinessException {
  constructor(
    message = 'Request parameters are invalid',
    data: unknown = null,
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, data);
  }
}

export class UnauthorizedBusinessException extends BusinessException {
  constructor(message = 'Unauthorized', data: unknown = null) {
    super(ErrorCode.UNAUTHORIZED, message, data);
  }
}

export class ForbiddenBusinessException extends BusinessException {
  constructor(message = 'Forbidden', data: unknown = null) {
    super(ErrorCode.FORBIDDEN, message, data);
  }
}

export class NotFoundBusinessException extends BusinessException {
  constructor(message = 'Resource not found', data: unknown = null) {
    super(ErrorCode.NOT_FOUND, message, data);
  }
}

export class ConflictBusinessException extends BusinessException {
  constructor(message = 'Resource conflict', data: unknown = null) {
    super(ErrorCode.CONFLICT, message, data);
  }
}

export class ExternalServiceBusinessException extends BusinessException {
  constructor(message = 'External service failed', data: unknown = null) {
    super(ErrorCode.EXTERNAL_SERVICE_ERROR, message, data);
  }
}

export class InternalBusinessException extends BusinessException {
  constructor(message = 'Internal server error', data: unknown = null) {
    super(ErrorCode.INTERNAL_ERROR, message, data);
  }
}
