import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TypegooseModule } from 'nestjs-typegoose';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { DeviceRepository } from './devices.repository';
import { DeviceEsp } from './models/device.model';

@Module({
  providers: [DeviceRepository, DevicesService],
  controllers: [DevicesController],
  imports: [TypegooseModule.forFeature([DeviceEsp]), UserModule],
  exports: [DeviceRepository, DevicesService],
})
export class DevicesModule {}
