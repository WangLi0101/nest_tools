import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IdParamDto {
  @ApiProperty({ description: 'Resource id', example: '2501' })
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class StartProcessDto {
  @ApiProperty({ description: 'Flowable process definition key', example: 'leave' })
  @IsString()
  @IsNotEmpty()
  processDefinitionKey: string;

  @ApiPropertyOptional({ description: 'Business key', example: 'order-1001' })
  @IsOptional()
  @IsString()
  businessKey?: string;

  @ApiPropertyOptional({
    description: 'Process variables',
    type: 'object',
    additionalProperties: true,
    example: { applicant: 'alice', days: 3 },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;
}

export class GetTasksQueryDto {
  @ApiPropertyOptional({ description: 'Task assignee', example: 'kermit' })
  @IsOptional()
  @IsString()
  assignee?: string;

  @ApiPropertyOptional({ description: 'Candidate group', example: 'managers' })
  @IsOptional()
  @IsString()
  group?: string;
}

export class CompleteTaskDto {
  @ApiPropertyOptional({
    description: 'Completion variables',
    type: 'object',
    additionalProperties: true,
    example: { approved: true },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;
}

export class GetHistoryProcessQueryDto {
  @ApiPropertyOptional({ description: 'Process instance id', example: '5001' })
  @IsOptional()
  @IsString()
  processInstanceId?: string;

  @ApiPropertyOptional({ description: 'Whether finished', example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (value === true || value === 'true') {
      return true;
    }
    if (value === false || value === 'false') {
      return false;
    }
    return value;
  })
  @IsBoolean()
  finished?: boolean;
}

export class GetHistoryTasksQueryDto {
  @ApiPropertyOptional({ description: 'Process instance id', example: '5001' })
  @IsOptional()
  @IsString()
  processInstanceId?: string;
}

export class AddTaskCommentDto {
  @ApiProperty({ description: 'Comment message', example: 'Approved' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
