import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OnlyofficeModule } from './onlyoffice/onlyoffice.module';

@Module({
  imports: [OnlyofficeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
