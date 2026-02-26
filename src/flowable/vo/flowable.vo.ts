import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class FlowablePagedResultVo {
  @ApiProperty({ type: () => [FlowableEntityVo] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowableEntityVo)
  data: FlowableEntityVo[];

  @ApiProperty({ example: 0 })
  @Expose()
  @Type(() => Number)
  @IsNumber()
  total: number;

  @ApiProperty({ example: 0 })
  @Expose()
  @Type(() => Number)
  @IsNumber()
  start: number;

  @ApiProperty({ example: 0 })
  @Expose()
  @Type(() => Number)
  @IsNumber()
  size: number;

  @ApiPropertyOptional({ example: 'id' })
  @Expose()
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 'asc' })
  @Expose()
  @IsOptional()
  @IsString()
  order?: string;
}

class FlowableEntityVo {
  @ApiPropertyOptional({ example: '2501' })
  @Expose()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({
    example: 'http://localhost:8080/flowable-rest/service/runtime/tasks/2501',
  })
  @Expose()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: 'Approve Request' })
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'leave' })
  @Expose()
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ example: 'order-1001' })
  @Expose()
  @IsOptional()
  @IsString()
  businessKey?: string;

  @ApiPropertyOptional({ example: 'leave:1:5004' })
  @Expose()
  @IsOptional()
  @IsString()
  processDefinitionId?: string;

  @ApiPropertyOptional({ example: '5001' })
  @Expose()
  @IsOptional()
  @IsString()
  processInstanceId?: string;

  @ApiPropertyOptional({ example: false })
  @Expose()
  @IsOptional()
  @IsBoolean()
  suspended?: boolean;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { approved: true },
  })
  @Expose()
  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;
}

class FlowableXmlVo {
  @ApiProperty({ example: '<?xml version="1.0" encoding="UTF-8"?>' })
  @Expose()
  @IsString()
  value: string;

  toJSON(): string {
    return this.value;
  }
}

class FlowableStringArrayVo {
  @ApiProperty({ type: [String], example: ['sid-1', 'sid-2'] })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  value: string[];

  toJSON(): string[] {
    return this.value;
  }
}

class FlowableObjectArrayVo {
  @ApiProperty({ type: () => [FlowableEntityVo] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowableEntityVo)
  value: FlowableEntityVo[];

  toJSON(): FlowableEntityVo[] {
    return this.value;
  }
}

export class GetProcessDefinitionsDataVo extends FlowablePagedResultVo {}
export class StartProcessDataVo extends FlowableEntityVo {}
export class GetTasksDataVo extends FlowablePagedResultVo {}
export class GetTaskDataVo extends FlowableEntityVo {}
export class CompleteTaskDataVo extends FlowableEntityVo {}
export class GetHistoryProcessDataVo extends FlowablePagedResultVo {}
export class GetHistoryTasksDataVo extends FlowablePagedResultVo {}
export class GetProcessDefinitionXmlDataVo extends FlowableXmlVo {}
export class GetProcessActiveActivityIdsDataVo extends FlowableStringArrayVo {}
export class GetTaskCommentsDataVo extends FlowableObjectArrayVo {}
export class AddTaskCommentDataVo extends FlowableEntityVo {}
