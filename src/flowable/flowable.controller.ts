import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { toValidatedVo } from '../common/vo';
import {
  AddTaskCommentDto,
  CompleteTaskDto,
  GetHistoryProcessQueryDto,
  GetHistoryTasksQueryDto,
  GetTasksQueryDto,
  IdParamDto,
  StartProcessDto,
} from './dto/flowable.dto';
import { FlowableService } from './flowable.service';
import {
  AddTaskCommentDataVo,
  CompleteTaskDataVo,
  GetHistoryProcessDataVo,
  GetHistoryTasksDataVo,
  GetProcessActiveActivityIdsDataVo,
  GetProcessDefinitionXmlDataVo,
  GetProcessDefinitionsDataVo,
  GetTaskCommentsDataVo,
  GetTaskDataVo,
  GetTasksDataVo,
  StartProcessDataVo,
} from './vo';

@Controller('flowable')
export class FlowableController {
  constructor(private readonly flowableService: FlowableService) {}

  @Get('definitions')
  async getProcessDefinitions(): Promise<GetProcessDefinitionsDataVo> {
    const data = await this.flowableService.getLatestProcessDefinitions();
    return toValidatedVo(GetProcessDefinitionsDataVo, data);
  }

  @Post('process')
  async startProcess(
    @Body() body: StartProcessDto,
  ): Promise<StartProcessDataVo> {
    const data = await this.flowableService.startProcessInstance(
      body.processDefinitionKey,
      body.businessKey,
      body.variables,
    );
    return toValidatedVo(StartProcessDataVo, data);
  }

  @Get('tasks')
  async getTasks(@Query() query: GetTasksQueryDto): Promise<GetTasksDataVo> {
    const data = await this.flowableService.getTasks(
      query.assignee,
      query.group,
    );
    return toValidatedVo(GetTasksDataVo, data);
  }

  @Get('tasks/:id')
  async getTask(@Param() params: IdParamDto): Promise<GetTaskDataVo> {
    const data = await this.flowableService.getTask(params.id);
    return toValidatedVo(GetTaskDataVo, data);
  }

  @Post('tasks/:id/complete')
  async completeTask(
    @Param() params: IdParamDto,
    @Body() body: CompleteTaskDto,
  ): Promise<CompleteTaskDataVo> {
    const data = await this.flowableService.completeTask(
      params.id,
      body.variables,
    );
    return toValidatedVo(CompleteTaskDataVo, data);
  }

  @Get('history/process')
  async getHistoryProcess(
    @Query() query: GetHistoryProcessQueryDto,
  ): Promise<GetHistoryProcessDataVo> {
    const data = await this.flowableService.getHistoricProcessInstances(
      query.processInstanceId,
      query.finished,
    );
    return toValidatedVo(GetHistoryProcessDataVo, data);
  }

  @Get('history/tasks')
  async getHistoryTasks(
    @Query() query: GetHistoryTasksQueryDto,
  ): Promise<GetHistoryTasksDataVo> {
    if (!query.processInstanceId) {
      return toValidatedVo(GetHistoryTasksDataVo, {
        data: [],
        total: 0,
        start: 0,
        size: 0,
      });
    }

    const data = await this.flowableService.getHistoricTaskInstances(
      query.processInstanceId,
    );
    return toValidatedVo(GetHistoryTasksDataVo, data);
  }

  @Get('definitions/:id/xml')
  async getProcessDefinitionXML(
    @Param() params: IdParamDto,
  ): Promise<GetProcessDefinitionXmlDataVo> {
    const data = await this.flowableService.getProcessDefinitionModel(
      params.id,
    );
    return toValidatedVo(GetProcessDefinitionXmlDataVo, { value: data });
  }

  @Get('process/:id/activity-ids')
  async getProcessActiveActivityIds(
    @Param() params: IdParamDto,
  ): Promise<GetProcessActiveActivityIdsDataVo> {
    const data = await this.flowableService.getProcessInstanceActiveActivityIds(
      params.id,
    );
    return toValidatedVo(GetProcessActiveActivityIdsDataVo, { value: data });
  }

  @Get('tasks/:id/comments')
  async getTaskComments(
    @Param() params: IdParamDto,
  ): Promise<GetTaskCommentsDataVo> {
    const data = await this.flowableService.getTaskComments(params.id);
    return toValidatedVo(GetTaskCommentsDataVo, { value: data });
  }

  @Post('tasks/:id/comments')
  async addTaskComment(
    @Param() params: IdParamDto,
    @Body() body: AddTaskCommentDto,
  ): Promise<AddTaskCommentDataVo> {
    const data = await this.flowableService.addTaskComment(
      params.id,
      body.message,
    );
    return toValidatedVo(AddTaskCommentDataVo, data);
  }
}
