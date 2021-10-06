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
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { DeviceVm } from './models/device-vm.model';
import { GetDeviceVm } from './models/getDevice-vm.model';
import { GetOperationId } from 'src/shared/utilities/get-operation-id';

@Controller('devices')
@ApiTags(DeviceEsp.modelName)
export class DevicesController {
  constructor(private readonly _deviceService: DevicesService) {}

  @Get(':deviceId')
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

      return result;
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/')
  @ApiResponse({ status: HttpStatus.CREATED, type: DeviceVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId(DeviceEsp.modelName, 'Create Device'))
  async addDevice(@Body() createdDevice: CreateDeviceDto): Promise<DeviceVm> {
    const { deviceId, deviceName } = createdDevice;

    if (!deviceName || deviceId) {
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

      const result = await this._deviceService.createDevice(createdDevice);

      return result;
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
