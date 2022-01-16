import { Test, TestingModule } from '@nestjs/testing';
import { ChainConnectorService as ChainConnectorService } from './chain-connector.service';

describe('ChainConnectorService', () => {
  let service: ChainConnectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChainConnectorService],
    }).compile();

    service = module.get<ChainConnectorService>(ChainConnectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
