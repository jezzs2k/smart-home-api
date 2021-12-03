import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as CronJob from 'cron';
import { DeviceRepository } from 'src/devices/devices.repository';
import { DeviceEsp } from 'src/devices/models/device.model';
import { FirebaseService } from 'src/firebase/firebase.service';
import { User, WorkerType } from 'src/user/models/user.model';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class WorkerService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly userRepository: UserRepository,
    private readonly firebaseService: FirebaseService,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  private handleOnOff = async (
    device: DeviceEsp,
    name: string,
    user: User,
    isTurnOn: boolean,
  ) => {
    await this.firebaseService.handleOnOffDevice(
      name,
      isTurnOn ? 'true' : 'false',
    );

    this.firebaseService.pushSpecificNotifyAndoird(
      `Thông báo ${isTurnOn ? 'bật' : 'tắt'} thiết bị`,
      'Thiết bị ' +
        device.deviceName +
        ` của bạn đã được ${isTurnOn ? 'bật' : 'tắt'}`,
      user.deviceToken,
    );

    device.isTurnOn = isTurnOn;

    await this.deviceRepository.updateById(device.id, device);
  };

  handleSaveWorker = async (workers: WorkerType[], userId: string) => {
    const user = await this.userRepository.findById(userId);

    if (user.workers?.length > 0) {
      workers = [...user.workers, ...workers];
    }

    user.workers = workers;

    await this.userRepository.updateById(userId, user);
  };

  async createWorkerRealLifeTime(
    name: string,
    date: string,
    userId: string,
    isTurnOn: boolean,
  ): Promise<Boolean> {
    const user = await this.userRepository.findById(userId);
    const device = await this.deviceRepository.findOne({ deviceId: name });

    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    const nDate = new Date(date);

    const callback = async () => {
      if (!isTurnOn) {
        await this.stopWorker(name, userId, device.deviceName, false, true);
      }

      await this.handleOnOff(device, name, user, isTurnOn);
    };

    const job = new CronJob.CronJob(nDate, callback);

    this.schedulerRegistry.addCronJob(name + String(isTurnOn), job);

    console.log(`Job stated turn ${isTurnOn ? 'on' : 'off'}`, nDate);

    job.start();

    return true;
  }

  async createWorker(
    name: string,
    seconds: number,
    userId: string,
  ): Promise<Boolean> {
    const user = await this.userRepository.findById(userId);
    const device = await this.deviceRepository.findOne({ deviceId: name });

    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }

    const callback = async () => {
      await this.stopWorker(name, userId, device.deviceName, false, false);

      await this.handleOnOff(device, name, user, !device.isTurnOn);
    };

    const timeout = setTimeout(callback, seconds * 1000);
    this.schedulerRegistry.addTimeout(name, timeout);

    console.log(`job ${name} added for each minute at ${seconds} seconds!`);

    let workers: WorkerType[] = [
      {
        name,
        seconds,
        isRunning: true,
        createdAt: new Date(),
        isRealLifeTime: false,
      },
    ];

    await this.handleSaveWorker(workers, userId);

    return true;
  }

  async checkHasExist(workerName: string, isTimeLife: boolean) {
    if (isTimeLife) {
      const check1 = this.schedulerRegistry.doesExists(
        'cron',
        workerName + 'true',
      );
      const check2 = this.schedulerRegistry.doesExists(
        'cron',
        workerName + 'false',
      );

      if (check1) {
        return check1;
      }

      if (check2) {
        return check2;
      }

      return check2;
    }

    return this.schedulerRegistry.doesExists('timeout', workerName);
  }

  async stopWorker(
    workerName: string,
    userId: string,
    deviceName: string,
    isPushNotifi = true,
    isTimeLife: boolean,
    isJustRemoveOne = false,
  ) {
    if (isTimeLife) {
      const workerName1 = workerName + 'true';
      const workerName2 = workerName + 'false';

      this.schedulerRegistry.deleteCronJob(workerName1);
      this.schedulerRegistry.deleteCronJob(workerName2);
      const user = await this.userRepository.findById(userId);

      user.workers = user.workers.filter(
        (item: WorkerType) => item.name1 !== workerName1,
      );

      await this.userRepository.updateById(userId, user);

      isPushNotifi &&
        this.firebaseService.pushSpecificNotifyAndoird(
          'Thông báo bật tắt thiết bị',
          'Hệ thống hẹn giờ cho thiết bị ' + deviceName + ' đã bị hủy.',
          user.deviceToken,
        );

      console.log(`job ${workerName1} and ${workerName2} deleted!`);
      return true;
    } else {
      this.schedulerRegistry.deleteTimeout(workerName);
      const user = await this.userRepository.findById(userId);

      user.workers = user.workers.filter(
        (item: WorkerType) => item.name !== workerName,
      );

      await this.userRepository.updateById(userId, user);

      isPushNotifi &&
        this.firebaseService.pushSpecificNotifyAndoird(
          'Thông báo bật tắt thiết bị',
          'Hệ thống hẹn giờ cho thiết bị ' + deviceName + ' đã bị hủy.',
          user.deviceToken,
        );

      console.log(`job ${workerName} deleted!`);
      return true;
    }
  }
}
