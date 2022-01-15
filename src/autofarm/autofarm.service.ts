import { JsonRpcProvider } from '@ethersproject/providers';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ethers } from 'ethers';
import * as MASTERCHEF_ABI from '../abi/masterchef.abi.json';
import * as ERC20_ABI from '../abi/erc20.abi.json'
import * as CAKELP_ABI from '../abi/cakeLP.abi.json'
import { getJsonRPCURL, getMasterChefContract } from 'src/config/rpc.config';
import { Contract, Provider } from 'ethers-multicall';

@Injectable()
export class AutofarmService {
    private provider: JsonRpcProvider;
    private masterchef: ethers.Contract;
    private multicall;
    private multicallMasterChef;

    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {
        this.provider = new ethers.providers.JsonRpcProvider(getJsonRPCURL())
        this.multicall = new Provider(this.provider, 56);
        this.masterchef = new ethers.Contract(getMasterChefContract(), MASTERCHEF_ABI, this.provider);
        this.multicallMasterChef = new Contract(getMasterChefContract(), MASTERCHEF_ABI)
    }

    async updateCache(): Promise<string>{
        const cachedPoolLength = await this.cacheManager.get("poolLength");
        const latestPoolLength = Number((await this.masterchef.poolLength())._hex)

        if (!cachedPoolLength || latestPoolLength) {
            this.cacheManager.set("poolLength", latestPoolLength);
            let temp = [];
            for (var i = 0; i<latestPoolLength; i++) {
                temp.push(this.multicallMasterChef.poolInfo(i));
            }
            const res = await this.multicall.all(temp);
            res.forEach(x => {
                console.log(x);
            });
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
