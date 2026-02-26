import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { InternalBusinessException } from '../exceptions/custom.exceptions';

export function toValidatedVo<T extends object>(
  cls: ClassConstructor<T>,
  payload: unknown,
): T {
  const instance = plainToInstance(cls, payload, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });
  const errors = validateSync(instance, {
    skipMissingProperties: false,
    forbidUnknownValues: true,
    whitelist: true,
  });

  if (errors.length > 0) {
    throw new InternalBusinessException('Response VO validation failed', {
      vo: cls.name,
      errors: errors.map((error) => ({
        property: error.property,
        constraints: error.constraints || {},
      })),
    });
  }

  return instance;
}
