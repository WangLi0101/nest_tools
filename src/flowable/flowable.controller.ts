import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkResponseWithData } from '../common/swagger';
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

@ApiTags('Flowable')
@Controller('flowable')
export class FlowableController {
  constructor(private readonly flowableService: FlowableService) {}

  @Get('definitions')
  @ApiOperation({ summary: 'Get latest process definitions' })
  @ApiOkResponseWithData({ model: GetProcessDefinitionsDataVo })
  async getProcessDefinitions(): Promise<GetProcessDefinitionsDataVo> {
    const data = await this.flowableService.getLatestProcessDefinitions();
    return toValidatedVo(GetProcessDefinitionsDataVo, data);
  }

  @Post('process')
  @ApiOperation({ summary: 'Start process instance' })
  @ApiBody({ type: StartProcessDto })
  @ApiOkResponseWithData({ model: StartProcessDataVo })
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
  @ApiOperation({ summary: 'Get tasks' })
  @ApiQuery({ name: 'assignee', required: false, example: 'kermit' })
  @ApiQuery({ name: 'group', required: false, example: 'managers' })
  @ApiOkResponseWithData({ model: GetTasksDataVo })
  async getTasks(@Query() query: GetTasksQueryDto): Promise<GetTasksDataVo> {
    const data = await this.flowableService.getTasks(
      query.assignee,
      query.group,
    );
    return toValidatedVo(GetTasksDataVo, data);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get task detail' })
  @ApiParam({ name: 'id', description: 'Task id', example: '2501' })
  @ApiOkResponseWithData({ model: GetTaskDataVo })
  async getTask(@Param() params: IdParamDto): Promise<GetTaskDataVo> {
    const data = await this.flowableService.getTask(params.id);
    return toValidatedVo(GetTaskDataVo, data);
  }

  @Post('tasks/:id/complete')
  @ApiOperation({ summary: 'Complete task' })
  @ApiParam({ name: 'id', description: 'Task id', example: '2501' })
  @ApiBody({ type: CompleteTaskDto })
  @ApiOkResponseWithData({ model: CompleteTaskDataVo })
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
  @ApiOperation({ summary: 'Get historic process instances' })
  @ApiQuery({ name: 'processInstanceId', required: false, example: '5001' })
  @ApiQuery({ name: 'finished', required: false, example: true })
  @ApiOkResponseWithData({ model: GetHistoryProcessDataVo })
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
  @ApiOperation({ summary: 'Get historic task instances' })
  @ApiQuery({ name: 'processInstanceId', required: false, example: '5001' })
  @ApiOkResponseWithData({ model: GetHistoryTasksDataVo })
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
  @ApiOperation({ summary: 'Get process definition XML' })
  @ApiParam({
    name: 'id',
    description: 'Process definition id',
    example: 'leave:1:5004',
  })
  @ApiOkResponseWithData({
    model: GetProcessDefinitionXmlDataVo,
    dataSchema: { type: 'string', example: '<?xml version="1.0"?>' },
  })
  async getProcessDefinitionXML(
    @Param() params: IdParamDto,
  ): Promise<GetProcessDefinitionXmlDataVo> {
    const data = await this.flowableService.getProcessDefinitionModel(
      params.id,
    );
    return toValidatedVo(GetProcessDefinitionXmlDataVo, { value: data });
  }

  @Get('process/:id/activity-ids')
  @ApiOperation({ summary: 'Get active activity ids' })
  @ApiParam({ name: 'id', description: 'Process instance id', example: '5001' })
  @ApiOkResponseWithData({
    model: GetProcessActiveActivityIdsDataVo,
    dataSchema: { type: 'array', items: { type: 'string' } },
  })
  async getProcessActiveActivityIds(
    @Param() params: IdParamDto,
  ): Promise<GetProcessActiveActivityIdsDataVo> {
    const data = await this.flowableService.getProcessInstanceActiveActivityIds(
      params.id,
    );
    return toValidatedVo(GetProcessActiveActivityIdsDataVo, { value: data });
  }

  @Get('tasks/:id/comments')
  @ApiOperation({ summary: 'Get task comments' })
  @ApiParam({ name: 'id', description: 'Task id', example: '2501' })
  @ApiOkResponseWithData({
    model: GetTaskCommentsDataVo,
    dataSchema: { type: 'array', items: { type: 'object' } },
  })
  async getTaskComments(
    @Param() params: IdParamDto,
  ): Promise<GetTaskCommentsDataVo> {
    const data = await this.flowableService.getTaskComments(params.id);
    return toValidatedVo(GetTaskCommentsDataVo, { value: data });
  }

  @Post('tasks/:id/comments')
  @ApiOperation({ summary: 'Add task comment' })
  @ApiParam({ name: 'id', description: 'Task id', example: '2501' })
  @ApiBody({ type: AddTaskCommentDto })
  @ApiOkResponseWithData({ model: AddTaskCommentDataVo })
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
