import { ApiException } from './../shared/api-exception.model';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
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
import { GetOperationId } from 'src/shared/utilities/get-operation-id';
import { GetUser } from '../shared/decorators/getUser.decorator';
import { UserRole } from '../user/models/user-role.enum';
import { Roles } from '../shared/decorators/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guard';
import { DevicesServiceV2 } from './devices.service.v2';
import { DeviceRepository } from './devices.repository';
import { UserRepository } from '../user/user.repository';

@Controller('devices')
@ApiTags('Devices')
@ApiBearerAuth()
export class DevicesControllerV2 {
  constructor(
    private readonly _deviceServiceV2: DevicesServiceV2,
    private readonly userRepository: UserRepository,
    private readonly deviceRepository: DeviceRepository,
  ) {}

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
      const result = await this._deviceServiceV2.getDevice(deviceId);

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
  async addDevice(@Body() createdDevice: CreateDeviceDto): Promise<DeviceVm> {
    const { deviceId, deviceName } = createdDevice;
    const user: any[] = await this.userRepository.findAll();

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

      const result = await this._deviceServiceV2.createDevice(
        createdDevice,
        user[0],
      );

      return result;
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
