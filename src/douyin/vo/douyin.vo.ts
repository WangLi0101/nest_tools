import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsString } from 'class-validator';

export class DouyinResolveDataVo {
  @ApiProperty({ example: 'https://v.douyin.com/IQ-uaVSmjUc/' })
  @Expose()
  @IsString()
  shareUrl: string;

  @ApiProperty({
    example:
      'https://www.douyin.com/video/7523320109629281576?previous_page=app_code_link',
  })
  @Expose()
  @IsString()
  resolvedUrl: string;

  @ApiProperty({ example: '7523320109629281576' })
  @Expose()
  @IsString()
  awemeId: string;

  @ApiProperty({ enum: ['video', 'images'], example: 'video' })
  @Expose()
  @IsIn(['video', 'images'])
  mediaType: 'video' | 'images';

  @ApiProperty({ example: '伊朗何以至此...' })
  @Expose()
  @IsString()
  title: string;

  @ApiProperty({ example: '学院派Academia' })
  @Expose()
  @IsString()
  author: string;

  @ApiProperty({
    example:
      'https://p3-pc-sign.douyinpic.com/tos-cn-p-0015/oAABH0xYxQABFQXJ.......jpeg',
  })
  @Expose()
  @IsString()
  coverUrl: string;

  @ApiProperty({
    type: [String],
    example: ['https://aweme.snssdk.com/aweme/v1/play/?video_id=xxx'],
  })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  videoUrls: string[];

  @ApiProperty({
    type: [String],
    example: ['https://p3-sign.douyinpic.com/tos-cn-p-0015/xxx.jpeg'],
  })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  imageUrls: string[];

  @ApiProperty({
    type: [String],
    example: [
      'https://aweme.snssdk.com/aweme/v1/play/?video_id=live_photo_xxx',
    ],
  })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  imageVideoUrls: string[];
}
