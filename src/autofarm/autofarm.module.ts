import { Module } from '@nestjs/common';
import { AutofarmController } from './autofarm.controller';
import { AutofarmService } from './autofarm.service';

@Module({
  controllers: [AutofarmController],
  providers: [AutofarmService]
})
export class AutofarmModule {}
