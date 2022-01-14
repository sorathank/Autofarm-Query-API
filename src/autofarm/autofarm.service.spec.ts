import { Test, TestingModule } from '@nestjs/testing';
import { AutofarmService } from './autofarm.service';

describe('AutofarmService', () => {
  let service: AutofarmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutofarmService],
    }).compile();

    service = module.get<AutofarmService>(AutofarmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
