import * as redisStore from 'cache-manager-redis-store'
import { CacheModule, Module } from '@nestjs/common';
import { MasterChefConnectorModule } from 'src/masterchefconnector/masterchefconnector.module';
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
    MasterChefConnectorModule.register(
      {
        rpcUrl: getBscJsonRpcUrl(),
        chainId: 56,
        masterChefAddr: getAutofarmMasterChefAddr(),
        masterchefABI: MASTERCHEF_ABI
      }
    )
  ],
  controllers: [AutofarmController],
  providers: [AutofarmService]
})
export class AutofarmModule {}
