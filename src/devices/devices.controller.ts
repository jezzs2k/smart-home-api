import { DeviceEsp } from './models/device.model';
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
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { DeviceVm } from './models/device-vm.model';
import { GetOperationId } from 'src/shared/utilities/get-operation-id';
import { GetUser } from '../shared/decorators/getUser.decorator';
import { User } from '../user/models/user.model';
import { UserRole } from '../user/models/user-role.enum';
import { Roles } from '../shared/decorators/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Reflector } from '@nestjs/core';

@Controller('devices')
@ApiBearerAuth()
@ApiTags(DeviceEsp.modelName)
export class DevicesController {
  constructor(private readonly _deviceService: DevicesService) {}

  @Get(':deviceId')
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.FOUND, type: DeviceVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId(DeviceEsp.modelName, 'Get Device'))
  async getDevice(@Param('deviceId') deviceId: string): Promise<DeviceVm> {
    if (!deviceId) {
      throw new HttpException(
        'You have must provide deviceId',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this._deviceService.getDevice(deviceId);

      console.log(result);

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
  @ApiOperation(GetOperationId(DeviceEsp.modelName, 'Create Device'))
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
      const deviceExist = await this._deviceService.findOne({ deviceId });

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

      return result;
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
