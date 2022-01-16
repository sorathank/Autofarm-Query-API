import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ethers } from 'ethers';
import * as MASTERCHEF_ABI from '../abi/autofarm/masterchef.abi.json';
import * as ERC20_ABI from '../abi/erc20.abi.json'
import * as CAKELP_ABI from '../abi/cakeLP.abi.json'
import { Contract, Provider } from 'ethers-multicall';
import { getJsonRPCURL, getMasterChefContract } from 'src/config/rpc.config';

@Injectable()
export class MasterchefConnectorService {
    private jsonRpcProvider: ethers.providers.JsonRpcProvider;
    private masterChef: ethers.Contract;
    private multicallProvider: Provider;
    private multicallMasterChef: Contract;
    
    constructor(
        private rpcUrl: string,
        private chainId: number,
        private masterChefAddr: string,
        private masterchefABI,
    ) {
        this.jsonRpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
        this.masterChef = new ethers.Contract(masterChefAddr, masterchefABI, this.jsonRpcProvider);

        this.multicallProvider = new Provider(this.jsonRpcProvider, chainId);
        this.multicallMasterChef = new Contract(masterChefAddr, masterchefABI)
    }

    getJsonRpcProvider(): ethers.providers.JsonRpcProvider {
        return this.jsonRpcProvider;
    }

    getMulticallProvider(): Provider {
        return this.multicallProvider;
    }

    getMasterchefContract(): ethers.Contract {
        return this.masterChef;
    }

    getMulticallMasterChef(): Contract {
        return this.multicallMasterChef;
    }

    async getPoolLength(): Promise<Number> {
        return Number(await this.masterChef.poolLength()._hex);
    }
}
