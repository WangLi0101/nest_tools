import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { toValidatedVo } from '../common/vo';
import { OnlyofficeService } from './onlyoffice.service';
import {
  FileIdParamDto,
  FileNameParamDto,
  OnlyofficeCallbackBodyDto,
  OnlyofficeCallbackQueryDto,
} from './dto/onlyoffice.dto';
import {
  OnlyofficeCallbackDataVo,
  OnlyofficeEditorConfigDataVo,
} from './vo';

@Controller('onlyoffice')
export class OnlyofficeController {
  constructor(private readonly onlyofficeService: OnlyofficeService) {}

  @Get('config/:fileId')
  async getConfig(
    @Param() params: FileIdParamDto,
    @Req() request: Request,
  ): Promise<OnlyofficeEditorConfigDataVo> {
    const userIp = request.ip || '127.0.0.1';
    const data = await this.onlyofficeService.getEditorConfig(params.fileId, userIp);
    return toValidatedVo(OnlyofficeEditorConfigDataVo, data);
  }

  @Post('callback')
  @HttpCode(200)
  async callback(
    @Body() body: OnlyofficeCallbackBodyDto,
    @Query() query: OnlyofficeCallbackQueryDto,
  ): Promise<OnlyofficeCallbackDataVo> {
    const data = await this.onlyofficeService.handleCallback(body, query);
    return toValidatedVo(OnlyofficeCallbackDataVo, data);
  }
}

@Controller('files')
export class FilesController {
  @Get(':fileName')
  getFile(@Param() params: FileNameParamDto, @Res() res: Response) {
    const { fileName } = params;
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
