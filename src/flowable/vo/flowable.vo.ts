import { Expose, Type } from 'class-transformer';
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
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowableEntityVo)
  data: FlowableEntityVo[];

  @Expose()
  @Type(() => Number)
  @IsNumber()
  total: number;

  @Expose()
  @Type(() => Number)
  @IsNumber()
  start: number;

  @Expose()
  @Type(() => Number)
  @IsNumber()
  size: number;

  @Expose()
  @IsOptional()
  @IsString()
  sort?: string;

  @Expose()
  @IsOptional()
  @IsString()
  order?: string;
}

class FlowableEntityVo {
  @Expose()
  @IsOptional()
  @IsString()
  id?: string;

  @Expose()
  @IsOptional()
  @IsString()
  url?: string;

  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  key?: string;

  @Expose()
  @IsOptional()
  @IsString()
  businessKey?: string;

  @Expose()
  @IsOptional()
  @IsString()
  processDefinitionId?: string;

  @Expose()
  @IsOptional()
  @IsString()
  processInstanceId?: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  suspended?: boolean;

  @Expose()
  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;
}

class FlowableXmlVo {
  @Expose()
  @IsString()
  value: string;

  toJSON(): string {
    return this.value;
  }
}

class FlowableStringArrayVo {
  @Expose()
  @IsArray()
  @IsString({ each: true })
  value: string[];

  toJSON(): string[] {
    return this.value;
  }
}

class FlowableObjectArrayVo {
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
