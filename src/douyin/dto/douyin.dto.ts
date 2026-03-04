import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResolveDouyinDto {
  @ApiProperty({
    description: '抖音分享口令或链接',
    example:
      '8.97 复制打开抖音，看看【学院派Academia的作品】... https://v.douyin.com/IQ-uaVSmjUc/',
  })
  @IsString()
  @IsNotEmpty()
  shareText: string;
}
