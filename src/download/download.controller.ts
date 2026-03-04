import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DownloadService } from './download.service';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get()
  @ApiOperation({
    summary: '代理下载远程文件',
    description:
      '传入远程文件 URL，服务端将其内容以流的形式转发给客户端，触发浏览器下载。',
  })
  @ApiQuery({
    name: 'url',
    required: true,
    type: String,
    description: '要下载的远程文件完整 URL（需 encodeURIComponent 编码）',
    example: 'https://example.com/video.mp4',
  })
  async proxyDownload(
    @Query('url') url: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!url) {
      throw new BadRequestException('参数 url 不能为空');
    }
    await this.downloadService.pipeRemoteFile(url, res);
  }
}
