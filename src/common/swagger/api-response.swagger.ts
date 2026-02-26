import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';

export class ApiEnvelopeVo {
  @ApiProperty({ example: 0 })
  code: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty()
  data: unknown;
}

type ApiOkResponseWithDataOptions = {
  model?: Type<unknown>;
  isArray?: boolean;
  description?: string;
  dataSchema?: Record<string, unknown>;
};

export function ApiOkResponseWithData(
  options: ApiOkResponseWithDataOptions = {},
) {
  const { model, isArray = false, description = 'OK', dataSchema } = options;
  const decorators = [ApiExtraModels(ApiEnvelopeVo)];

  if (model) {
    decorators.push(ApiExtraModels(model));
  }

  let resolvedDataSchema: Record<string, unknown> = { type: 'object' };
  if (dataSchema) {
    resolvedDataSchema = dataSchema;
  } else if (model) {
    resolvedDataSchema = isArray
      ? {
          type: 'array',
          items: { $ref: getSchemaPath(model) },
        }
      : { $ref: getSchemaPath(model) };
  }

  decorators.push(
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiEnvelopeVo) },
          {
            properties: {
              data: resolvedDataSchema,
            },
          },
        ],
      },
    }),
  );

  return applyDecorators(...decorators);
}
