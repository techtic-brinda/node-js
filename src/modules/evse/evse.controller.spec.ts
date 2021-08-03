import { Test, TestingModule } from '@nestjs/testing';
import { VehicleMakeController } from './vehicle-make.controller';

describe('Drawer Controller', () => {
  let controller: VehicleMakeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleMakeController],
    }).compile();

    controller = module.get<VehicleMakeController>(VehicleMakeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
