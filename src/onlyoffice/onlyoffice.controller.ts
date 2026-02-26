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
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ApiOkResponseWithData } from '../common/swagger';
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

@ApiTags('OnlyOffice')
@Controller('onlyoffice')
export class OnlyofficeController {
  constructor(private readonly onlyofficeService: OnlyofficeService) {}

  @Get('config/:fileId')
  @ApiOperation({ summary: 'Get onlyoffice editor config' })
  @ApiParam({ name: 'fileId', description: 'File id', example: 'demo.pdf' })
  @ApiOkResponseWithData({ model: OnlyofficeEditorConfigDataVo })
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
  @ApiOperation({ summary: 'Onlyoffice callback' })
  @ApiConsumes('application/json')
  @ApiBody({ type: OnlyofficeCallbackBodyDto })
  @ApiQuery({ name: 'fileName', required: true, example: 'demo.pdf' })
  @ApiOkResponseWithData({ model: OnlyofficeCallbackDataVo })
  async callback(
    @Body() body: OnlyofficeCallbackBodyDto,
    @Query() query: OnlyofficeCallbackQueryDto,
  ): Promise<OnlyofficeCallbackDataVo> {
    const data = await this.onlyofficeService.handleCallback(body, query);
    return toValidatedVo(OnlyofficeCallbackDataVo, data);
  }
}

@ApiTags('Files')
@Controller('files')
export class FilesController {
  @Get(':fileName')
  @ApiOperation({ summary: 'Get file stream' })
  @ApiParam({ name: 'fileName', description: 'File name', example: 'demo.pdf' })
  @ApiProduces('application/octet-stream')
  @ApiOkResponse({
    description: 'Binary file stream',
    schema: { type: 'string', format: 'binary' },
  })
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
