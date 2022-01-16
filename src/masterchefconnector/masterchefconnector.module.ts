import { DynamicModule, Module } from '@nestjs/common';
import { MasterChefConnectorOptions } from './masterchefconnector.options';
import { MasterChefConnectorService } from './masterchefconnector.service';

@Module({})
export class MasterChefConnectorModule {
  static register(options: MasterChefConnectorOptions): DynamicModule {
    return {
      module: MasterChefConnectorModule,
      providers: [
        {
          provide: 'MASTERCHEF_CONNECTOR_OPTIONS',
          useValue: options
        },
        MasterChefConnectorService
      ],
      exports: [MasterChefConnectorService]
    }
  }
}
