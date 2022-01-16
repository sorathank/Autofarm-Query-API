import { CacheModule, Module } from '@nestjs/common';
import { MasterchefConnectorService } from './masterchefconnector.service';

@Module({
  providers: [MasterchefConnectorService],
  exports: [MasterchefConnectorService]
})
export class MasterchefConnectorModule {}
