import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutofarmModule } from './autofarm/autofarm.module';
import { MasterchefConnectorModule } from './masterchefconnector/masterchefconnector.module';

@Module({
  imports: [AutofarmModule, MasterchefConnectorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
