import { Test, TestingModule } from '@nestjs/testing';
import { MasterChefConnectorService as MasterChefConnectorService } from './masterchefconnector.service';

describe('MasterChefConnectorService', () => {
  let service: MasterChefConnectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MasterChefConnectorService],
    }).compile();

    service = module.get<MasterChefConnectorService>(MasterChefConnectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
