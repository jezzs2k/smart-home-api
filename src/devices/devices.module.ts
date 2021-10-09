import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TypegooseModule } from 'nestjs-typegoose';
import { DevicesServiceV2 } from './devices.service.v2';
import { DevicesControllerV2 } from './devices.controller.v2';
import { DeviceRepository } from './devices.repository';
import { DeviceEspV2 } from './models/device.model.v2';

@Module({
  providers: [DevicesServiceV2, DeviceRepository],
  controllers: [DevicesControllerV2],
  imports: [TypegooseModule.forFeature([DeviceEspV2]), UserModule],
  exports: [DevicesServiceV2, DeviceRepository],
})
export class DevicesModule {}
