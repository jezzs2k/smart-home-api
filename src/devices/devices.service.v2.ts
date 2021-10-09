import {
  HttpException,
  Injectable,
  HttpStatus,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { MapperService } from 'src/shared/mapper/mapper.service';
import { DeviceVm } from './models/device-vm.model';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { User } from '../user/models/user.model';
import { UserServiceV2 } from '../user/user.service.v2';
import { BaseServiceV2 } from '../shared/base.service.v2';
import { DeviceEspV2 } from './models/device.model.v2';
import { DeviceRepository } from './devices.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class DevicesServiceV2 extends BaseServiceV2<DeviceEspV2> {
  constructor(
    private readonly _mapperDevice: MapperService,
    private readonly deviceRepository: DeviceRepository,
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => UserServiceV2))
    private readonly _userServiceV2: UserServiceV2,
  ) {
    super();

    this._repository = deviceRepository;
    this._mapper = _mapperDevice.mapper;
  }

  async createDevice(
    createDeviceDto: CreateDeviceDto,
    user: User,
  ): Promise<DeviceVm> {
    const { deviceId, deviceName } = createDeviceDto;

    const deviceType = createDeviceDto?.deviceType;
    const isConnected = !!createDeviceDto?.isConnected;

    const newDeviceEsp = this._repository.createModel();

    newDeviceEsp.deviceId = deviceId;
    newDeviceEsp.deviceName = deviceName;
    newDeviceEsp.isConnected = isConnected;
    newDeviceEsp.createdBy = user;

    if (deviceType) newDeviceEsp.deviceType = deviceType;

    try {
      const userFound = await this.userRepository.findById(user.id);

      if (!userFound) {
        throw new HttpException("User dosen't found", HttpStatus.NOT_FOUND);
      }

      userFound.devicesEsp.push(
        this.deviceRepository.toObjectId(newDeviceEsp.id),
      );

      const values = await Promise.all([
        this._repository.create(newDeviceEsp),
        this.userRepository.updateById(user.id, userFound),
      ]);

      return this.map<DeviceVm>(values[0].toJSON());
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDevice(deviceId: string): Promise<DeviceVm> {
    try {
      const device = await this._repository
        .findOne({ deviceId })
        .populate('createdBy', 'username email', this.userRepository.modelName);

      if (!device) {
        throw new HttpException(
          "This device haven't been existed !",
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.map<DeviceVm>(device);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
