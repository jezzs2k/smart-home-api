import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { BaseRepository, ModelType } from '../shared/base.respository';
import { DeviceEsp } from './models/device.model';

@Injectable()
export class DeviceRepository extends BaseRepository<DeviceEsp> {
  constructor(
    @InjectModel(DeviceEsp)
    private readonly devicesModel: ModelType<DeviceEsp>,
  ) {
    super(devicesModel);
  }
}
