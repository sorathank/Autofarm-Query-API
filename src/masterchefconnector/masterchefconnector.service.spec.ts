import { Test, TestingModule } from '@nestjs/testing';
import { MasterchefConnectorService } from './masterchefconnector.service';

describe('MasterchefConnectorService', () => {
  let service: MasterchefConnectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MasterchefConnectorService],
    }).compile();

    service = module.get<MasterchefConnectorService>(MasterchefConnectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
