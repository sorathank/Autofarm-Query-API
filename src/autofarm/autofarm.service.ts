import { JsonRpcProvider } from '@ethersproject/providers';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ethers } from 'ethers';
import * as ERC20_ABI from '../abi/erc20.abi.json'
import * as CAKELP_ABI from '../abi/cakeLP.abi.json'
import { getBscJsonRpcUrl, getAutofarmMasterChefAddr } from 'src/config/rpc.config';
import { Contract, Provider } from 'ethers-multicall';
import { MasterChefConnectorService } from 'src/masterchefconnector/masterchefconnector.service';

@Injectable()
export class AutofarmService {

    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private masterchefConnector: MasterChefConnectorService,
    ) {}

    async updateCache(): Promise<string>{
        /*TODO: FETCH Pool informations
        REQUIRED INFORMATIONS
        - Pool'id (for indexing)

        - Staked LP Address, Decimals

        - Token 0 Address, Symbol, Decimals
        - Token 1 Address, Symbol, Decimals

        - Reward Address, Symbol, Decimals

        - Strat Address (MAYBE!??)
        */
        const cachedPoolLength = await this.cacheManager.get("autofarmPoolLength");
        const latestPoolLength = await this.getPoolLength();
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
        
        // return await latestPoolLength.toString();
        return latestPoolLength.toString();
    }

    async getAddressInformation(address: string): Promise<string>{
        return "Hello"
    }

    private async getPoolLength(): Promise<Number> {
        const masterChef = this.masterchefConnector.getMasterChefContract();
        return Number((await masterChef.poolLength())._hex);
    }

}
