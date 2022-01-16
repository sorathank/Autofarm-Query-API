import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutofarmModule } from './autofarm/autofarm.module';
import { MasterChefConnectorModule } from './masterchefconnector/masterchefconnector.module';

@Module({
  imports: [AutofarmModule, MasterChefConnectorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
