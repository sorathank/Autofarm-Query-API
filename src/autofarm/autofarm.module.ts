import * as redisStore from 'cache-manager-redis-store'
import { CacheModule, Module } from '@nestjs/common';
import { MasterchefConnectorModule } from 'src/masterchefconnector/masterchefconnector.module';
import { AutofarmController } from './autofarm.controller';
import { AutofarmService } from './autofarm.service';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: "cache",
      port: "6379",
      ttl: 0
    }),
    MasterchefConnectorModule
  ],
  controllers: [AutofarmController],
  providers: [AutofarmService]
})
export class AutofarmModule {}
