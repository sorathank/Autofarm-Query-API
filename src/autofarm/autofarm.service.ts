import { JsonRpcProvider } from '@ethersproject/providers';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Contract, ethers } from 'ethers';
import * as MASTERCHEF_ABI from '../abi/masterchef.abi.json';
import * as ERC20_ABI from '../abi/erc20.abi.json'
import * as CAKELP_ABI from '../abi/cakeLP.abi.json'
import { getJsonRPCURL, getMasterChefContract } from 'src/config/rpc.config';

@Injectable()
export class AutofarmService {
    private provider: JsonRpcProvider;
    private masterchef: Contract

    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {
        this.provider = new ethers.providers.JsonRpcProvider(getJsonRPCURL())
        this.masterchef = new Contract(getMasterChefContract(), MASTERCHEF_ABI, this.provider);
    }

    async updateCache(): Promise<string>{
        const cachedPoolLength = await this.cacheManager.get("poolLength");
        const latestPoolLength = Number((await this.masterchef.poolLength())._hex)
        if (!cachedPoolLength || latestPoolLength) {
            this.cacheManager.set("poolLength", latestPoolLength);
            console.log(await this.cacheManager.get('poolLength'))
        }
        
        return "Cache Updated"
    }

    async getAddressInformation(address: string): Promise<string>{
        await this.cacheManager.set("cache", "Updated")
        console.log(await this.cacheManager.get("cache"))
        return await this.cacheManager.get("cache")
        return "Hello"
    }

}
