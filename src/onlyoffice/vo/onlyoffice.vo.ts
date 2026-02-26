import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OnlyofficePermissionsVo {
  @Expose()
  @IsBoolean()
  edit: boolean;

  @Expose()
  @IsBoolean()
  download: boolean;

  @Expose()
  @IsBoolean()
  print: boolean;
}

export class OnlyofficeDocumentVo {
  @Expose()
  @IsString()
  fileType: string;

  @Expose()
  @IsString()
  key: string;

  @Expose()
  @IsString()
  title: string;

  @Expose()
  @IsString()
  url: string;

  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficePermissionsVo)
  permissions: OnlyofficePermissionsVo;
}

export class OnlyofficeCustomizationVo {
  @Expose()
  @IsBoolean()
  forcesave: boolean;
}

export class OnlyofficeCoEditingVo {
  @Expose()
  @IsString()
  mode: string;

  @Expose()
  @IsBoolean()
  change: boolean;
}

export class OnlyofficeUserVo {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  name: string;
}

export class OnlyofficeEditorConfigVo {
  @Expose()
  @IsString()
  callbackUrl: string;

  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficeCustomizationVo)
  customization: OnlyofficeCustomizationVo;

  @Expose()
  @IsString()
  lang: string;

  @Expose()
  @IsString()
  mode: string;

  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficeCoEditingVo)
  coEditing: OnlyofficeCoEditingVo;

  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficeUserVo)
  user: OnlyofficeUserVo;
}

export class OnlyofficeEditorConfigDataVo {
  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficeDocumentVo)
  document: OnlyofficeDocumentVo;

  @Expose()
  @IsString()
  documentType: string;

  @Expose()
  @ValidateNested()
  @Type(() => OnlyofficeEditorConfigVo)
  editorConfig: OnlyofficeEditorConfigVo;

  @Expose()
  @IsString()
  token: string;

  @Expose()
  @IsString()
  documentServerUrl: string;
}

export class OnlyofficeCallbackDataVo {
  @Expose()
  @IsNumber()
  error: number;
}
