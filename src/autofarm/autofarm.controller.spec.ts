import { Test, TestingModule } from '@nestjs/testing';
import { AutofarmController } from './autofarm.controller';

describe('AutofarmController', () => {
  let controller: AutofarmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutofarmController],
    }).compile();

    controller = module.get<AutofarmController>(AutofarmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
