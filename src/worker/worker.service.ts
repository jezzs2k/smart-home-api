import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as cron from 'cron';
import { DeviceRepository } from 'src/devices/devices.repository';
import { FirebaseService } from 'src/firebase/firebase.service';
import { WorkerType } from 'src/user/models/user.model';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class WorkerService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly userRepository: UserRepository,
    private readonly firebaseService: FirebaseService,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async createWorker(
    name: string,
    seconds: string,
    userId: string,
  ): Promise<Boolean> {
    const user = await this.userRepository.findById(userId);
    const device = await this.deviceRepository.findOne({ deviceId: name });

    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }

    const job = new cron.CronJob(`*/${seconds} * * * * *`, async () => {
      console.log(`time (${seconds}) for job ${name} to run!`);
      await this.stopWorker(name, userId, device.deviceName);

      await this.firebaseService.handleOnOffDevice(
        name,
        device.isTurnOn ? 'false' : 'true',
      );

      this.firebaseService.pushSpecificNotifyAndoird(
        'Thông báo bật tắt thiết bị',
        'Thiết bị ' + device.deviceName + ' của bạn đã được bật/Tắt',
        user.deviceToken,
      );

      device.isTurnOn = !device.isTurnOn;

      await this.deviceRepository.updateById(device.id, device);
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    console.log(`job ${name} added for each minute at ${seconds} seconds!`);

    let workers: WorkerType[] = [
      {
        name,
        seconds,
        isRunning: true,
        createdAt: new Date(),
      },
    ];

    if (user.workers?.length > 0) {
      workers = [...user.workers, ...workers];
    }

    user.workers = workers;

    await this.userRepository.updateById(userId, user);

    return true;
  }

  async checkHasExist(workerName: string) {
    return this.schedulerRegistry.doesExists('cron', workerName);
  }

  async stopWorker(workerName: string, userId: string, deviceName: string) {
    this.schedulerRegistry.deleteCronJob(workerName);
    const user = await this.userRepository.findById(userId);

    user.workers = user.workers.filter(
      (item: WorkerType) => item.name !== workerName,
    );

    await this.userRepository.updateById(userId, user);

    this.firebaseService.pushSpecificNotifyAndoird(
      'Thông báo bật tắt thiết bị',
      'Hệ thống hẹn giờ cho thiết bị ' + deviceName + ' đã bị hủy.',
      user.deviceToken,
    );

    console.log(`job ${workerName} deleted!`);
    return true;
  }
}
