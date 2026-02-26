import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class IdParamDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class StartProcessDto {
  @IsString()
  @IsNotEmpty()
  processDefinitionKey: string;

  @IsOptional()
  @IsString()
  businessKey?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;
}

export class GetTasksQueryDto {
  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  group?: string;
}

export class CompleteTaskDto {
  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;
}

export class GetHistoryProcessQueryDto {
  @IsOptional()
  @IsString()
  processInstanceId?: string;

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
  @IsOptional()
  @IsString()
  processInstanceId?: string;
}

export class AddTaskCommentDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
