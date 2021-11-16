import { DeviceUpdateEspVm } from './models/device.dto';
import { ApiException } from '../shared/api-exception.model';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { DeviceVm } from './models/device-vm.model';
import * as admin from 'firebase-admin';
import { GetUser } from '../shared/decorators/getUser.decorator';
import { UserRole } from '../user/models/user-role.enum';
import { Roles } from '../shared/decorators/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guard';
import { DevicesService } from './devices.service';
import { DeviceRepository } from './devices.repository';
import { UserRepository } from '../user/user.repository';
import { User } from 'src/user/models/user.model';
import { FirebaseService } from 'src/firebase/firebase.service';

@Controller('devices')
@ApiTags('Devices')
@ApiBearerAuth()
export class DevicesController {
  constructor(
    private readonly _deviceService: DevicesService,
    private readonly userRepository: UserRepository,
    private readonly deviceRepository: DeviceRepository,
  ) {}

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

  @Get(':deviceId')
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.FOUND, type: DeviceVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async getDevice(@Param('deviceId') deviceId: string): Promise<DeviceVm> {
    if (!deviceId) {
      throw new HttpException(
        'You have must provide deviceId',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this._deviceService.getDevice(deviceId);

      return result;
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/')
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.CREATED, type: DeviceVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async addDevice(
    @Body() createdDevice: CreateDeviceDto,
    @GetUser() user: User,
  ): Promise<DeviceVm> {
    const { deviceId, deviceName } = createdDevice;

    if (!deviceName || !deviceId) {
      throw new HttpException(
        'Params have must writing!',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const deviceExist = await this.deviceRepository.findOne({ deviceId });

      if (deviceExist) {
        throw new HttpException(
          'This device have been existed !',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this._deviceService.createDevice(
        createdDevice,
        user,
      );

      await this.handleCreateDevice(result.deviceId);

      return result;
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/')
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.FOUND, type: DeviceVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async getDeviceByUserId(@GetUser() user: User): Promise<DeviceVm[]> {
    const result = await this._deviceService.getDeviceByUserId(user.id);

    return result;
  }

  @Put('/:deviceId')
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.FOUND, type: DeviceVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async updateDevice(
    @Param('deviceId') deviceId: string,
    @Body() deviceDto: DeviceUpdateEspVm,
  ): Promise<DeviceVm> {
    if (!deviceId) {
      throw new HttpException(
        'Device Id have must writing!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this._deviceService.updateDevice(deviceId, deviceDto);

    return result;
  }
}
