import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { BaseRepository, ModelType } from '../shared/base.respository';
import { DeviceEspV2 } from './models/device.model.v2';

@Injectable()
export class DeviceRepository extends BaseRepository<DeviceEspV2> {
  constructor(
    @InjectModel(DeviceEspV2)
    private readonly devicesModel: ModelType<DeviceEspV2>,
  ) {
    super(devicesModel);
  }
}
