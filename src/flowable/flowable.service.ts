import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  ConflictBusinessException,
  ExternalServiceBusinessException,
  ForbiddenBusinessException,
  NotFoundBusinessException,
  UnauthorizedBusinessException,
  ValidationBusinessException,
} from '../common/exceptions/custom.exceptions';

@Injectable()
export class FlowableService {
  private axiosInstance: AxiosInstance;
  private readonly baseUrl = 'http://localhost:8080/flowable-rest/service'; // 修改为你的 Flowable 地址
  private readonly auth = {
    username: 'admin', // 修改为你的 Flowable 用户名
    password: 'test', // 修改为你的 Flowable 密码
  };

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      auth: this.auth,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Generic request handler to handle errors gracefully
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error) {
      console.error(
        'Flowable API Error:',
        error.response?.data || error.message,
      );
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Flowable service error';
      const detail = {
        status,
        source: 'flowable',
        response: error.response?.data || null,
      };

      if (status === 401) {
        throw new UnauthorizedBusinessException('Flowable authentication failed', detail);
      }
      if (status === 403) {
        throw new ForbiddenBusinessException('Flowable access denied', detail);
      }
      if (status === 404) {
        throw new NotFoundBusinessException('Flowable resource not found', detail);
      }
      if (status === 409) {
        throw new ConflictBusinessException('Flowable resource conflict', detail);
      }

      throw new ExternalServiceBusinessException(message, detail);
    }
  }

  // --- 1. 流程定义 Process Definitions ---

  /**
   * 获取最新的流程定义列表
   */
  async getLatestProcessDefinitions() {
    return this.request({
      method: 'GET',
      url: '/repository/process-definitions',
      params: { latest: true },
    });
  }

  /**
   * 获取指定 key 的流程定义
   */
  async getProcessDefinitionByKey(key: string) {
    return this.request({
      method: 'GET',
      url: '/repository/process-definitions',
      params: { key, latest: true },
    });
  }

  // --- 2. 流程实例 Process Instances ---

  /**
   * 启动流程实例
   * @param processDefinitionKey 流程定义Key
   * @param businessKey 业务主键
   * @param variables 流程变量
   */
  async startProcessInstance(
    processDefinitionKey: string,
    businessKey?: string,
    variables?: Record<string, any>,
  ) {
    if (!processDefinitionKey) {
      throw new ValidationBusinessException('processDefinitionKey is required');
    }

    const formattedVariables = variables
      ? Object.keys(variables).map((key) => ({
          name: key,
          value: variables[key],
        }))
      : [];

    return this.request({
      method: 'POST',
      url: '/runtime/process-instances',
      data: {
        processDefinitionKey,
        businessKey,
        variables: formattedVariables,
      },
    });
  }

  /**
   * 获取流程实例列表
   */
  async getProcessInstances(params?: any) {
    return this.request({
      method: 'GET',
      url: '/runtime/process-instances',
      params,
    });
  }

  // --- 3. 任务管理 Tasks ---

  /**
   * 查询任务
   * @param assignee 指派给谁 (User ID)
   * @param candidateGroup 候选组
   */
  async getTasks(assignee?: string, candidateGroup?: string) {
    const params: any = {};
    if (assignee) params.assignee = assignee;
    if (candidateGroup) params.candidateGroup = candidateGroup;

    return this.request({
      method: 'GET',
      url: '/runtime/tasks',
      params,
    });
  }

  /**
   * 获取任务详情
   * @param taskId 任务ID
   */
  async getTask(taskId: string) {
    if (!taskId) {
      throw new ValidationBusinessException('taskId is required');
    }

    return this.request({
      method: 'GET',
      url: `/runtime/tasks/${taskId}`,
    });
  }

  /**
   * 完成任务
   * @param taskId 任务ID
   * @param variables 需要传递的变量 (如审批结果)
   */
  async completeTask(taskId: string, variables?: Record<string, any>) {
    if (!taskId) {
      throw new ValidationBusinessException('taskId is required');
    }

    const formattedVariables = variables
      ? Object.keys(variables).map((key) => ({
          name: key,
          value: variables[key],
        }))
      : [];

    return this.request({
      method: 'POST',
      url: `/runtime/tasks/${taskId}`,
      data: {
        action: 'complete',
        variables: formattedVariables,
      },
    });
  }

  // --- 4. 历史记录 History ---

  /**
   * 获取历史流程实例 (查询只读的历史数据)
   */
  async getHistoricProcessInstances(
    processInstanceId?: string,
    finished?: boolean,
  ) {
    const params: any = {};
    if (processInstanceId) params.processInstanceId = processInstanceId;
    if (finished !== undefined) params.finished = finished;

    return this.request({
      method: 'GET',
      url: '/history/historic-process-instances',
      params,
    });
  }

  /**
   * 获取历史任务记录 (审批日志)
   */
  async getHistoricTaskInstances(processInstanceId: string) {
    if (!processInstanceId) {
      throw new ValidationBusinessException('processInstanceId is required');
    }

    return this.request({
      method: 'GET',
      url: '/history/historic-task-instances',
      params: { processInstanceId },
    });
  }

  // --- 5. 流程图与监控 Diagram & Monitor ---

  /**
   * 获取流程定义XML (用于前端画图)
   */
  async getProcessDefinitionModel(processDefinitionId: string) {
    if (!processDefinitionId) {
      throw new ValidationBusinessException('processDefinitionId is required');
    }

    // resourceData response is usually raw bytes or text, need special handling if not JSON
    // However, flowable-rest returns JSON unless asking for raw resource
    // Let's try to get the BPMN model directly via model-source if possible or resource-content
    // Standard flowable: GET /repository/process-definitions/{processDefinitionId}/resourcedata

    const response = await this.axiosInstance.get(
      `/repository/process-definitions/${processDefinitionId}/resourcedata`,
      { responseType: 'text' }, // Important: we want XML string
    );
    return response.data;
  }

  /**
   * 获取流程实例的活动节点 (用于高亮)
   */
  async getProcessInstanceActiveActivityIds(processInstanceId: string) {
    if (!processInstanceId) {
      throw new ValidationBusinessException('processInstanceId is required');
    }

    // 正在运行的活动节点
    return this.request<string[]>({
      method: 'GET',
      url: `/runtime/process-instances/${processInstanceId}/active-activity-ids`,
    });
  }

  /**
   * 获取任务评论/意见
   */
  async getTaskComments(taskId: string) {
    if (!taskId) {
      throw new ValidationBusinessException('taskId is required');
    }

    return this.request({
      method: 'GET',
      url: `/runtime/tasks/${taskId}/comments`,
    });
  }

  /**
   * 添加任务评论
   */
  async addTaskComment(taskId: string, message: string) {
    if (!taskId) {
      throw new ValidationBusinessException('taskId is required');
    }
    if (!message || !message.trim()) {
      throw new ValidationBusinessException('message is required');
    }

    return this.request({
      method: 'POST',
      url: `/runtime/tasks/${taskId}/comments`,
      data: { message, saveProcessInstanceId: true },
    });
  }
}
