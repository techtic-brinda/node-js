import { Test, TestingModule } from '@nestjs/testing';
import { ChargerTypeController } from './charger-type.controller';

describe('Drawer Controller', () => {
  let controller: ChargerTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargerTypeController],
    }).compile();

    controller = module.get<ChargerTypeController>(ChargerTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
