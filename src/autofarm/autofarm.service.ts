import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Contract, ethers } from 'ethers';
import * as MASTERCHEF_ABI from '../abi/autofarm/masterchef.abi.json'
import * as ERC20_ABI from '../abi/erc20.abi.json'
import * as CAKELP_ABI from '../abi/cakeLP.abi.json'
import { ChainConnectorService } from 'src/chain-connector/chain-connector.service';
import { getAutofarmMasterChefAddr } from 'src/config/rpc.config';

@Injectable()
export class AutofarmService {
    private masterchef: Contract;

    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private chainConnector: ChainConnectorService,
    ) {
        this.masterchef = new Contract(getAutofarmMasterChefAddr(), MASTERCHEF_ABI, chainConnector.getJsonRpcProvider());
    }

    /*TODO: FETCH Pool informations
    REQUIRED INFORMATIONS
    - Pool'id (for indexing)

    - Staked LP Address, Decimals

    - Token 0 Address, Symbol, Decimals
    - Token 1 Address, Symbol, Decimals

    - Reward Address, Symbol, Decimals

    - Strat Address (MAYBE!??)
    */
    async updateCache(): Promise<string> {
        
        const cachedPoolLength = await this.cacheManager.get("autofarmPoolLength");
        const latestPoolLength = await this.getPoolLength();
        if (!cachedPoolLength || latestPoolLength !== cachedPoolLength) {
            const addresses: string[] = (await this.fetchPoolInfo(latestPoolLength)).map(pool => pool[0]);
            await this.fetchTokenName(await addresses);
        }

        // return await latestPoolLength.toString();
        return latestPoolLength.toString();
    }

    async getAddressInformation(address: string): Promise<string> {
        return "Hello"
    }

    private async getPoolLength(): Promise<number> {
        return parseInt((await this.masterchef.poolLength())._hex, 16);
    }

    private async fetchPoolInfo(n: number) {
        this.masterchef.poolInfo()
        return
    }

    private async fetchTokenName(addresses: string[]) {
        return
    }

}
