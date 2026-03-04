import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseWithData } from '../common/swagger';
import { toValidatedVo } from '../common/vo';
import { ResolveDouyinDto } from './dto/douyin.dto';
import { DouyinService } from './douyin.service';
import { DouyinResolveDataVo } from './vo';

@ApiTags('Douyin')
@Controller('douyin')
export class DouyinController {
  constructor(private readonly douyinService: DouyinService) {}

  @Post('resolve')
  @ApiOperation({
    summary: '解析抖音分享链接并返回无水印下载地址（无需 Cookie）',
  })
  @ApiBody({ type: ResolveDouyinDto })
  @ApiOkResponseWithData({ model: DouyinResolveDataVo })
  async resolveShareText(
    @Body() body: ResolveDouyinDto,
  ): Promise<DouyinResolveDataVo> {
    const data = await this.douyinService.resolveNoWatermarkShareLink(
      body.shareText,
    );
    return toValidatedVo(DouyinResolveDataVo, data);
  }

  @Get('resolve')
  @ApiOperation({
    summary: '通过 query 参数解析抖音分享链接并返回无水印下载地址',
  })
  @ApiQuery({ name: 'shareText', required: true, type: String })
  @ApiOkResponseWithData({ model: DouyinResolveDataVo })
  async resolveByQuery(
    @Query('shareText') shareText: string,
  ): Promise<DouyinResolveDataVo> {
    const data =
      await this.douyinService.resolveNoWatermarkShareLink(shareText);
    return toValidatedVo(DouyinResolveDataVo, data);
  }
}
