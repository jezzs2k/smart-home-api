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
import { User, WorkerType } from 'src/user/models/user.model';
import { CreateWorkerResponse } from './worker-response';
import {
  CreateWorkerRealLifeTimeOnOffVm,
  CreateWorkerVm,
} from './worker-vm.model';
import { WorkerService } from './worker.service';

@Controller('worker')
@ApiTags('worker')
@ApiBearerAuth()
export class WorkerController {
  constructor(
    private readonly workerService: WorkerService,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  @Post('/lifetime')
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.OK, type: CreateWorkerResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async createWorkerRealLifeTimeOnOff(
    @Body() createWorker: CreateWorkerRealLifeTimeOnOffVm,
    @GetUser() userPayload: User,
  ): Promise<CreateWorkerResponse> {
    const userId = userPayload.id;
    const { deviceId, dateOn, dateOff } = createWorker;

    if (!deviceId || !dateOn || !dateOff) {
      throw new HttpException(
        'Device id have must be provider !',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const isSuccess1 = await this.workerService.createWorkerRealLifeTime(
        deviceId,
        dateOn,
        userId,
        true,
      );

      const isSuccess2 = await this.workerService.createWorkerRealLifeTime(
        deviceId,
        dateOff,
        userId,
        false,
      );

      let workers: WorkerType[] = [
        {
          name1: deviceId + 'true',
          name2: deviceId + 'false',
          isRunning: true,
          createdAt: new Date(),
          isRealLifeTime: true,
          dateOn,
          dateOff,
        },
      ];

      await this.workerService.handleSaveWorker(workers, userId);

      return { success: (isSuccess1 === isSuccess2) === true };
    } catch (error) {
      throw new HttpException(
        error.message ?? 'Create worker failer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

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
        true,
        false,
      );

      return { success: isSuccess };
    } catch (error) {
      throw new HttpException(
        error.message ?? 'Create worker failer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('/reallife/:deviceId')
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.OK, type: CreateWorkerResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async stopRealLifeWorker(
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
        true,
        true,
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

    const isHas = await this.workerService.checkHasExist(deviceId, false);
    const isHas1 = await this.workerService.checkHasExist(deviceId, true);
    const device = await this.deviceRepository.findOne({ deviceId });

    if (isHas) {
      await this.workerService.stopWorker(
        deviceId,
        userId,
        device.deviceName,
        true,
        false,
      );
      return { success: true };
    }

    if (isHas1) {
      await this.workerService.stopWorker(
        deviceId,
        userId,
        device.deviceName,
        true,
        true,
      );
      return { success: true };
    }

    return { success: false };
  }
}
