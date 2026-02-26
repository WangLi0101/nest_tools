import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OnlyofficePermissionsVo {
  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  edit: boolean;

  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  download: boolean;

  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  print: boolean;
}

export class OnlyofficeDocumentVo {
  @ApiProperty({ example: 'pdf' })
  @Expose()
  @IsString()
  fileType: string;

  @ApiProperty({ example: 'demo.pdf-1730000000' })
  @Expose()
  @IsString()
  key: string;

  @ApiProperty({ example: 'demo.pdf' })
  @Expose()
  @IsString()
  title: string;

  @ApiProperty({ example: 'http://localhost:3000/files/demo.pdf' })
  @Expose()
  @IsString()
  url: string;

  @ApiProperty({ type: () => OnlyofficePermissionsVo })
  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficePermissionsVo)
  permissions: OnlyofficePermissionsVo;
}

export class OnlyofficeCustomizationVo {
  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  forcesave: boolean;
}

export class OnlyofficeCoEditingVo {
  @ApiProperty({ example: 'fast' })
  @Expose()
  @IsString()
  mode: string;

  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  change: boolean;
}

export class OnlyofficeUserVo {
  @ApiProperty({ example: '1700000000' })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({ example: 'User 1700000000' })
  @Expose()
  @IsString()
  name: string;
}

export class OnlyofficeEditorConfigVo {
  @ApiProperty({
    example: 'http://localhost:3000/onlyoffice/callback?fileName=demo.pdf',
  })
  @Expose()
  @IsString()
  callbackUrl: string;

  @ApiProperty({ type: () => OnlyofficeCustomizationVo })
  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficeCustomizationVo)
  customization: OnlyofficeCustomizationVo;

  @ApiProperty({ example: 'zh-CN' })
  @Expose()
  @IsString()
  lang: string;

  @ApiProperty({ example: 'edit' })
  @Expose()
  @IsString()
  mode: string;

  @ApiProperty({ type: () => OnlyofficeCoEditingVo })
  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficeCoEditingVo)
  coEditing: OnlyofficeCoEditingVo;

  @ApiProperty({ type: () => OnlyofficeUserVo })
  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficeUserVo)
  user: OnlyofficeUserVo;
}

export class OnlyofficeEditorConfigDataVo {
  @ApiProperty({ type: () => OnlyofficeDocumentVo })
  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficeDocumentVo)
  document: OnlyofficeDocumentVo;

  @ApiProperty({ example: 'pdf' })
  @Expose()
  @IsString()
  documentType: string;

  @ApiProperty({ type: () => OnlyofficeEditorConfigVo })
  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficeEditorConfigVo)
  editorConfig: OnlyofficeEditorConfigVo;

  @ApiProperty({ example: 'jwt-token-string' })
  @Expose()
  @IsString()
  token: string;

  @ApiProperty({ example: 'http://localhost:8080' })
  @Expose()
  @IsString()
  documentServerUrl: string;
}

export class OnlyofficeCallbackDataVo {
  @ApiProperty({ example: 0 })
  @Expose()
  @IsNumber()
  error: number;
}
