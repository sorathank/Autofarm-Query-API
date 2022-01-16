import * as redisStore from 'cache-manager-redis-store'
import { CacheModule, Module } from '@nestjs/common';
import { ChainConnectorModule } from 'src/chain-connector/chain-connector.module';
import { AutofarmController } from './autofarm.controller';
import { AutofarmService } from './autofarm.service';
import { getBscJsonRpcUrl, getAutofarmMasterChefAddr } from 'src/config/rpc.config';
import * as MASTERCHEF_ABI from '../abi/autofarm/masterchef.abi.json';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: "cache",
      port: "6379",
      ttl: 0
    }),
    ChainConnectorModule.register(
      {
        rpcUrl: getBscJsonRpcUrl(),
        chainId: 56,
      }
    )
  ],
  controllers: [AutofarmController],
  providers: [AutofarmService]
})
export class AutofarmModule {}
