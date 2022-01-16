import { Inject, Injectable } from '@nestjs/common';
import { Contract, ContractInterface, ethers, providers } from 'ethers';
import { ChainConnectorOptions } from './chain-connector.options';

@Injectable()
export class ChainConnectorService {
    private jsonRpcProvider: providers.JsonRpcProvider;
    
    constructor(
        @Inject('CHAIN_CONNECTOR_OPTIONS')
        private options: ChainConnectorOptions
    ) {
        this.jsonRpcProvider = new ethers.providers.JsonRpcProvider(options.rpcUrl);
    }

    getJsonRpcProvider():  providers.JsonRpcProvider{
        return this.jsonRpcProvider;
    }

    getContract(addr: string, abi: ContractInterface): Contract{
        return new Contract(addr, abi, this.jsonRpcProvider)
    }
}
