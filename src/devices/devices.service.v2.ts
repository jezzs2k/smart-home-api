import { DeviceUpdateEspVm } from './models/device.dto';
import { UserV2 } from 'src/user/models/user.model.v2';
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
    user: UserV2,
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
      const device = await this._repository.findOne({ deviceId });

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

  async getDeviceByUserId(userId: string): Promise<DeviceVm[]> {
    try {
      const devices = await this._repository.findAll({
        createdBy: { _id: userId },
      });

      return this.map<DeviceVm[]>(devices, true);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateDevice(
    deviceId: string,
    deviceDto: DeviceUpdateEspVm,
  ): Promise<DeviceVm> {
    try {
      const device = await this._repository.findOne({ deviceId });

      if (!device) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }

      const deviceName = deviceDto.deviceName;
      const deviceType = deviceDto.deviceType;
      const isConnected = deviceDto.isConnected;

      if (deviceName) device.deviceName = deviceName;
      if (deviceType) device.deviceType = deviceType;
      if (isConnected != null) device.isConnected = isConnected;

      return await this._repository.updateById(device.id, device);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
