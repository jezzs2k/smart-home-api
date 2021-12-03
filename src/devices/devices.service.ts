import { DeviceUpdateEspVm } from './models/device.dto';
import { User } from 'src/user/models/user.model';
import {
  HttpException,
  Injectable,
  HttpStatus,
  forwardRef,
  Inject,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { MapperService } from 'src/shared/mapper/mapper.service';
import { DeviceVm } from './models/device-vm.model';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { UserService } from '../user/user.service';
import { BaseService } from '../shared/base.service';
import { DeviceEsp } from './models/device.model';
import { DeviceRepository } from './devices.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class DevicesService extends BaseService<DeviceEsp> {
  constructor(
    private readonly _mapperDevice: MapperService,
    private readonly deviceRepository: DeviceRepository,
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => UserService))
    private readonly _userService: UserService,
  ) {
    super();

    this._repository = deviceRepository;
    this._mapper = _mapperDevice.mapper;
  }

  handleCreateDevice = async (deviceId: string) => {
    const db = admin.database();

    const ref = db.ref();
    let data: any = {};

    const snap = await ref.ref.get();

    if (Object.entries(snap.val()).length > 0) {
      data = { ...snap.val() };
    }

    data[deviceId] = {
      isActive: false,
    };

    if (data && Object.entries(data).length > 0) {
      const result = await ref.ref.set(data, () => {});
    }
  };

  handleDeleteDeviceOnFirebase = async (deviceId: string) => {
    const db = admin.database();

    const ref = db.ref(deviceId);

    await ref.remove();
  };

  async createDevice(
    createDeviceDto: CreateDeviceDto,
    user: User,
  ): Promise<DeviceVm> {
    const { deviceId, deviceName, icon } = createDeviceDto;

    const deviceType = createDeviceDto?.deviceType;
    const isConnected = !!createDeviceDto?.isConnected;

    const newDeviceEsp = this._repository.createModel();

    newDeviceEsp.deviceId = deviceId;
    newDeviceEsp.deviceName = deviceName;
    newDeviceEsp.isConnected = isConnected;
    newDeviceEsp.createdBy = user;
    newDeviceEsp.icon = icon;

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
      const isTurnOn = deviceDto.isTurnOn;
      const icon = deviceDto.icon;

      if (deviceName) device.deviceName = deviceName;
      if (deviceType) device.deviceType = deviceType;
      if (isConnected != null) device.isConnected = isConnected;
      if (isTurnOn != null) device.isTurnOn = isTurnOn;
      if (icon != null) device.icon = icon;

      return await this._repository.updateById(device.id, device);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDevice(deviceId: string, user: User): Promise<DeviceVm> {
    try {
      const device = await this._repository.findOne({ deviceId });

      if (!device) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }

      const userFound = await this.userRepository.findById(user.id);

      if (!userFound) {
        throw new HttpException("User dosen't found", HttpStatus.NOT_FOUND);
      }

      const newDevices = userFound.devicesEsp.filter(
        (item) => item !== device.id,
      );

      userFound.devicesEsp = newDevices;

      await Promise.all([
        this._repository.deleteOne({ deviceId }),
        this.userRepository.updateById(user.id, userFound),
      ]);

      return this.map<DeviceVm>(device);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
