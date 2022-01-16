import { DynamicModule, Module } from '@nestjs/common';
import { ChainConnectorOptions as ChainConnectorOptions } from './chain-connector.options';
import { ChainConnectorService as ChainConnectorService } from './chain-connector.service';

@Module({})
export class ChainConnectorModule {
  static register(options: ChainConnectorOptions): DynamicModule {
    return {
      module: ChainConnectorModule,
      providers: [
        {
          provide: 'CHAIN_CONNECTOR_OPTIONS',
          useValue: options
        },
        ChainConnectorService
      ],
      exports: [ChainConnectorService]
    }
  }
}
