import { Inject, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as ERC20_ABI from '../abi/erc20.abi.json'
import * as CAKELP_ABI from '../abi/cakeLP.abi.json'
import { Contract, Provider } from 'ethers-multicall';
import { MasterChefConnectorOptions } from './masterchefconnector.options';

@Injectable()
export class MasterChefConnectorService {
    private jsonRpcProvider: ethers.providers.JsonRpcProvider;
    private masterChef: ethers.Contract;
    private multicallProvider: Provider;
    private multicallMasterChef: Contract;
    
    constructor(
        @Inject('MASTERCHEF_CONNECTOR_OPTIONS')
        private options: MasterChefConnectorOptions
    ) {
        this.jsonRpcProvider = new ethers.providers.JsonRpcProvider(options.rpcUrl);
        this.masterChef = new ethers.Contract(options.masterChefAddr, options.masterchefABI, this.jsonRpcProvider);

        this.multicallProvider = new Provider(this.jsonRpcProvider, options.chainId);
        this.multicallMasterChef = new Contract(options.masterChefAddr, options.masterchefABI)
    }

    getJsonRpcProvider(): ethers.providers.JsonRpcProvider {
        return this.jsonRpcProvider;
    }

    getMulticallProvider(): Provider {
        return this.multicallProvider;
    }

    getMasterChefContract(): ethers.Contract {
        return this.masterChef;
    }

    getMulticallMasterChef(): Contract {
        return this.multicallMasterChef;
    }
}
