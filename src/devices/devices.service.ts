import { BaseService } from './../shared/base.service';
import {
  HttpException,
  Injectable,
  HttpStatus,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { DeviceEsp } from './models/device.model';
import { MapperService } from 'src/shared/mapper/mapper.service';
import { InjectModel } from '@nestjs/mongoose';
import { ModelType, InstanceType } from 'typegoose';
import { DeviceVm } from './models/device-vm.model';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { User } from '../user/models/user.model';
import { UserService } from '../user/user.service';

@Injectable()
export class DevicesService extends BaseService<DeviceEsp> {
  constructor(
    private readonly _mapperDevice: MapperService,
    @InjectModel(DeviceEsp.modelName)
    private readonly _modelDevice: ModelType<InstanceType<DeviceEsp>>,
    @Inject(forwardRef(() => UserService))
    private readonly _userService: UserService,
  ) {
    super();

    this._mapper = _mapperDevice.mapper;
    this._model = _modelDevice;
  }

  async createDevice(
    createDeviceDto: CreateDeviceDto,
    user: User,
  ): Promise<DeviceVm> {
    const { deviceId, deviceName } = createDeviceDto;

    const deviceType = createDeviceDto?.deviceType;
    const isConnected = !!createDeviceDto?.isConnected;

    const newDeviceEsp = new DeviceEsp();

    newDeviceEsp.deviceId = deviceId;
    newDeviceEsp.deviceName = deviceName;
    newDeviceEsp.isConnected = isConnected;
    newDeviceEsp.createdBy = user;

    if (deviceType) newDeviceEsp.deviceType = deviceType;

    try {
      const result = await this._model.create(newDeviceEsp);

      return this.map<DeviceVm>(result.toJSON());
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDevice(deviceId: string): Promise<DeviceVm> {
    try {
      const device = await this.findOneWithPopulate(
        { deviceId },
        'createdBy',
        null,
        User.modelName,
      );

      if (!device) {
        throw new HttpException(
          "This device haven't been existed !",
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.map<DeviceVm>(device.toJSON());
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
