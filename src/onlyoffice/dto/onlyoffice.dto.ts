import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileIdParamDto {
  @ApiProperty({ description: 'File id', example: 'demo.pdf' })
  @IsString()
  @IsNotEmpty()
  fileId: string;
}

export class FileNameParamDto {
  @ApiProperty({ description: 'File name', example: 'demo.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;
}

export class OnlyofficeCallbackBodyDto {
  @ApiPropertyOptional({ description: 'OnlyOffice callback status', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({
    description: 'Download URL from OnlyOffice callback',
    example: 'http://localhost:8080/cache/files/abc/output.docx',
  })
  @IsOptional()
  @IsString()
  url?: string;
}

export class OnlyofficeCallbackQueryDto {
  @ApiProperty({ description: 'File name', example: 'demo.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;
}
