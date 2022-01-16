import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutofarmModule } from './autofarm/autofarm.module';
import { ChainConnectorModule } from './chain-connector/chain-connector.module';

@Module({
  imports: [AutofarmModule, ChainConnectorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
