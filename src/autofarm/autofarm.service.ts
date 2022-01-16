import { JsonRpcProvider } from '@ethersproject/providers';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ethers } from 'ethers';
import * as MASTERCHEF_ABI from '../abi/autofarm/masterchef.abi.json';
import * as ERC20_ABI from '../abi/erc20.abi.json'
import * as CAKELP_ABI from '../abi/cakeLP.abi.json'
import { getJsonRPCURL, getMasterChefContract } from 'src/config/rpc.config';
import { Contract, Provider } from 'ethers-multicall';
import { MasterchefConnectorService } from 'src/masterchefconnector/masterchefconnector.service';

@Injectable()
export class AutofarmService {

    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private masterchefConnector: MasterchefConnectorService,
    ) {
        this.masterchefConnector = new MasterchefConnectorService(
            getJsonRPCURL(),
            56,
            getMasterChefContract(),
            MASTERCHEF_ABI
        )
    }

    async updateCache(): Promise<string>{
        const cachedPoolLength = await this.cacheManager.get("poolLength");
        const latestPoolLength = await this.masterchefConnector.getPoolLength();

        // if (!cachedPoolLength || latestPoolLength) {
        //     this.cacheManager.set("poolLength", latestPoolLength);
        //     let temp = [];
        //     for (var i = 0; i<latestPoolLength; i++) {
        //         temp.push(this.multicallMasterChef.poolInfo(i));
        //     }
        //     const res = await this.multicall.all(temp);
        //     res.forEach(x => {
        //         console.log(x);
        //     });
        // }
        
        return latestPoolLength.toString();
        return "Cache Updated"
    }

    async getAddressInformation(address: string): Promise<string>{
        await this.cacheManager.set("cache", "Updated")
        console.log(await this.cacheManager.get("cache"))
        return await this.cacheManager.get("cache")
        return "Hello"
    }

}
