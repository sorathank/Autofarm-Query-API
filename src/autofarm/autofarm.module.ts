import * as redisStore from 'cache-manager-redis-store'
import { CacheModule, Module } from '@nestjs/common';
import { AutofarmController } from './autofarm.controller';
import { AutofarmService } from './autofarm.service';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: "cache",
      port: "6379",
      ttl: 0
    })
  ],
  controllers: [AutofarmController],
  providers: [AutofarmService]
})
export class AutofarmModule {}
