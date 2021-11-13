import {
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Body,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeviceRepository } from 'src/devices/devices.repository';
import { ApiException } from 'src/shared/api-exception.model';
import { GetUser } from 'src/shared/decorators/getUser.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { UserRole } from 'src/user/models/user-role.enum';
import { User } from 'src/user/models/user.model';
import { CreateWorkerResponse } from './worker-response';
import { CreateWorkerVm } from './worker-vm.model';
import { WorkerService } from './worker.service';

@Controller('worker')
@ApiTags('worker')
@ApiBearerAuth()
export class WorkerController {
  constructor(
    private readonly workerService: WorkerService,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  @Post('/')
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.OK, type: CreateWorkerResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async createWorker(
    @Body() createWorker: CreateWorkerVm,
    @GetUser() userPayload: User,
  ): Promise<CreateWorkerResponse> {
    const userId = userPayload.id;
    const { deviceId, seconds } = createWorker;

    if (!deviceId || !seconds) {
      throw new HttpException(
        'Device id have must be provider !',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const isSuccess = await this.workerService.createWorker(
        deviceId,
        seconds,
        userId,
      );

      return { success: isSuccess };
    } catch (error) {
      throw new HttpException(
        error.message ?? 'Create worker failer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':deviceId')
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.OK, type: CreateWorkerResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async stopWorker(
    @Param('deviceId') deviceId: string,
    @GetUser() userPayload: User,
  ): Promise<CreateWorkerResponse> {
    const userId = userPayload.id;
    if (!deviceId) {
      throw new HttpException(
        'Device id have must be provider !',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const device = await this.deviceRepository.findOne({ deviceId });
      const isSuccess = await this.workerService.stopWorker(
        deviceId,
        userId,
        device.deviceName,
      );

      return { success: isSuccess };
    } catch (error) {
      throw new HttpException(
        error.message ?? 'Create worker failer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('/check/:deviceId')
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.OK, type: CreateWorkerResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async checkAndStopIfExist(
    @Param('deviceId') deviceId: string,
    @GetUser() userPayload: User,
  ): Promise<CreateWorkerResponse> {
    const userId = userPayload.id;
    if (!deviceId) {
      throw new HttpException(
        'Device id have must be provider !',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isHas = await this.workerService.checkHasExist(deviceId);
    const device = await this.deviceRepository.findOne({ deviceId });

    if (isHas) {
      await this.workerService.stopWorker(deviceId, userId, device.deviceName);
      return { success: true };
    }

    return { success: false };
  }
}
