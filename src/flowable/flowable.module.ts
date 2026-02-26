import { Module } from '@nestjs/common';
import { FlowableService } from './flowable.service';
import { FlowableController } from './flowable.controller';

@Module({
  controllers: [FlowableController],
  providers: [FlowableService],
  exports: [FlowableService],
})
export class FlowableModule {}
