import { Inject, Injectable } from '@nestjs/common';
import { Contract, ContractInterface, ethers, providers } from 'ethers';
import * as multicall from 'ethers-multicall'
import { ChainConnectorOptions } from './chain-connector.options';

@Injectable()
export class ChainConnectorService {
    private jsonRpcProvider: providers.JsonRpcProvider;
    private multicallProvider: multicall.Provider;
    
    constructor(
        @Inject('CHAIN_CONNECTOR_OPTIONS')
        private options: ChainConnectorOptions
    ) {
        this.jsonRpcProvider = new ethers.providers.JsonRpcProvider(options.rpcUrl);
        this.multicallProvider = new multicall.Provider(this.jsonRpcProvider, options.chainId)
    }

    getJsonRpcProvider():  providers.JsonRpcProvider{
        return this.jsonRpcProvider;
    }

    getContract(addr: string, abi: ContractInterface): Contract{
        const contract: Contract = new Contract(addr, abi,this.jsonRpcProvider)
        return contract
    }

    getMulticallProvider() {
        return this.multicallProvider;
    }

    getMulticallContract(addr: string, abi) {
        const contract: multicall.Contract = new multicall.Contract(addr, abi)
        return contract;
    }

}
