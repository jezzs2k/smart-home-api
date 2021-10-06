import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceEsp } from './models/device.model';

@Module({
  providers: [DevicesService],
  controllers: [DevicesController],
  imports: [
    MongooseModule.forFeature([
      { name: DeviceEsp.modelName, schema: DeviceEsp.model.schema },
    ]),
  ],
  exports: [DevicesService],
})
export class DevicesModule {}
