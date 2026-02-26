import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class FileIdParamDto {
  @IsString()
  @IsNotEmpty()
  fileId: string;
}

export class FileNameParamDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;
}

export class OnlyofficeCallbackBodyDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsString()
  url?: string;
}

export class OnlyofficeCallbackQueryDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;
}
