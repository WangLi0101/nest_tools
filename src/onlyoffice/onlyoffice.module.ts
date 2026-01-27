import { Module } from '@nestjs/common';
import { OnlyofficeService } from './onlyoffice.service';
import { OnlyofficeController, FilesController } from './onlyoffice.controller';

@Module({
  controllers: [OnlyofficeController, FilesController],
  providers: [OnlyofficeService],
})
export class OnlyofficeModule {}
