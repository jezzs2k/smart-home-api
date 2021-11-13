import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import { DeviceRepository } from 'src/devices/devices.repository';
import { DeviceEsp } from 'src/devices/models/device.model';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { ConfigurationsService } from 'src/shared/configurations/configurations.service';

const ServiceAccount = require('../../../smart-home-87480-firebase-adminsdk-295mc-19be7d9e07.json');

@Injectable()
export class FirebaseConfig {
  private readonly serviceAccount = ServiceAccount;

  constructor(
    private readonly _deviceService: DeviceRepository,
    private readonly _configuration: ConfigurationsService,
    private readonly cacheManager: RedisCacheService,
  ) {
    this.configurationFirebase();
  }

  private async configurationFirebase() {
    admin.initializeApp({
      credential: admin.credential.cert(this.serviceAccount),
      databaseURL: this._configuration.get('DATA_BASE_URL_FIREBASE'),
    });

    const db = admin.database();

    const ref = db.ref();
    ref.on('value', async (snapshot) => {
      const isRunAllRealTime = await this.cacheManager.get<Boolean>(
        'isRunAllRealTime',
      );

      // const totalRealTime = await this.cacheManager.get<number>(
      //   'totalRealTime',
      // );

      await this.cacheManager.set<Boolean>('isRunAllRealTime', true, {
        ttl: 24 * 60 * 60,
      });

      if (
        (typeof isRunAllRealTime === 'boolean' && isRunAllRealTime) ||
        typeof isRunAllRealTime !== 'boolean'
      ) {
        const data = snapshot.val();

        // const totalData = snapshot.numChildren();

        // if (totalRealTime && totalData === totalRealTime) {
        //   return;
        // }

        // snapshot.exists() &&
        //   totalData !== totalRealTime &&
        //   (await this.cacheManager.set<number>('totalRealTime', totalData, {
        //     ttl: 60 * 60,
        //   }));

        if (data) {
          for (const key in data) {
            if (data[key]?.isActive === 'true') {
            } else {
              const deviceCache = await this.cacheManager.get<DeviceEsp>(key);

              if (_.isNull(deviceCache)) {
                const device = await this._deviceService.findOne({
                  deviceId: key,
                });

                await this.cacheManager.set(key, device, { ttl: 3600 });

                if (!device) {
                  db.ref(key + '/isActive').set('true');
                } else {
                  db.ref(key).set({
                    isActive: 'true',
                    setUser: device.createdBy.id,
                    isResetUserIdEeprom: 'false',
                    isResetEeprom: 'false',
                    isTurnOn: 'false',
                    isConnected: data[key]?.isConnected || 'false',
                  });
                }
              } else {
                db.ref(key).set({
                  isActive: 'true',
                  setUser: deviceCache.createdBy.id,
                  isResetUserIdEeprom: 'false',
                  isResetEeprom: 'false',
                  isTurnOn: 'false',
                  isConnected: data[key]?.isConnected || 'false',
                });
              }
            }

            if (data[key]?.isConnected === 'true') {
              const device = await this._deviceService.findOne({
                deviceId: key,
              });

              device.isConnected = true;
              await this._deviceService.updateById(device.id, device);
            } else {
              const device = await this._deviceService.findOne({
                deviceId: key,
              });

              device.isConnected = false;
              await this._deviceService.updateById(device.id, device);
            }

            if (
              data[key]?.isTurnOn === 'true' &&
              data[key]?.isConnected === 'true'
            ) {
              const deviceCache = await this.cacheManager.get<DeviceEsp>(key);

              if (_.isNull(deviceCache)) {
                const device = await this._deviceService.findOne({
                  deviceId: key,
                });

                device.isTurnOn = true;
                const deviceUpdated = await this._deviceService.updateById(
                  device.id,
                  device,
                );

                await this.cacheManager.set<DeviceEsp>(key, deviceUpdated, {
                  ttl: 900,
                });
              } else {
                deviceCache.isTurnOn = true;
                const deviceUpdated = await this._deviceService.updateById(
                  deviceCache.id,
                  deviceCache,
                );

                await this.cacheManager.set<DeviceEsp>(key, deviceUpdated, {
                  ttl: 900,
                });
              }
            }

            if (
              data[key]?.isTurnOn === 'false' &&
              data[key]?.isConnected === 'true'
            ) {
              const deviceCache = await this.cacheManager.get<DeviceEsp>(key);

              if (_.isNull(deviceCache)) {
                const device = await this._deviceService.findOne({
                  deviceId: key,
                });

                device.isTurnOn = false;
                const deviceUpdated = await this._deviceService.updateById(
                  device.id,
                  device,
                );

                await this.cacheManager.set<DeviceEsp>(key, deviceUpdated, {
                  ttl: 900,
                });
              } else {
                deviceCache.isTurnOn = false;
                const deviceUpdated = await this._deviceService.updateById(
                  deviceCache.id,
                  deviceCache,
                );

                await this.cacheManager.set<DeviceEsp>(key, deviceUpdated, {
                  ttl: 900,
                });
              }
            }
          }
        }
      }
    });
  }
}
