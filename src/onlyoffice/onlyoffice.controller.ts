import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Res,
  StreamableFile,
  Req,
  HttpCode,
} from '@nestjs/common';
import { OnlyofficeService } from './onlyoffice.service';
import { Response, Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('onlyoffice')
export class OnlyofficeController {
  constructor(private readonly onlyofficeService: OnlyofficeService) {}

  // 获取编辑器配置
  @Get('config/:fileId')
  getConfig(@Param('fileId') fileId: string, @Req() request: Request) {
    const userIp = request.ip || '127.0.0.1';
    return this.onlyofficeService.getEditorConfig(fileId, userIp);
  }

  // 处理 OnlyOffice 回调
  @Post('callback')
  @HttpCode(200)
  async callback(@Body() body: any, @Query() query: any) {
    return this.onlyofficeService.handleCallback(body, query);
  }
}

@Controller('files')
export class FilesController {
  // 获取文件流
  @Get(':fileName')
  @Get(':fileName')
  getFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'files', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).end();
    }

    const ext = path.extname(fileName).toLowerCase();

    const mimeMap = {
      '.pdf': 'application/pdf',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.xlsx':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.pptx':
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };

    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    fs.createReadStream(filePath).pipe(res);
  }
}
