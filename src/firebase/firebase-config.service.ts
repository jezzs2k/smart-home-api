import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import { DeviceRepository } from 'src/devices/devices.repository';
import { DeviceEsp } from 'src/devices/models/device.model';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { ConfigurationsService } from 'src/shared/configurations/configurations.service';
import { setTimeout } from 'timers';

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

    await this.cacheManager.set<Boolean>('isRunAllRealTime', true);

    const ref = db.ref();

    ref.once('value', (snap) => {
      const data = snap.val();

      for (const key in data) {
        if (data[key].isNewItem === 'false') {
          this.createRealtime(key);
        }
      }
    });

    setTimeout(() => {
      ref.on('value', async (snapshot) => {
        const isRunAllRealTime = await this.cacheManager.get<Boolean>(
          'isRunAllRealTime',
        );

        await this.cacheManager.set<Boolean>('isRunAllRealTime', true, {
          ttl: 24 * 60 * 60,
        });

        const data = snapshot.val();

        if (
          (typeof isRunAllRealTime === 'boolean' && isRunAllRealTime) ||
          typeof isRunAllRealTime !== 'boolean'
        ) {
          if (data) {
            for (const key in data) {
              if (data[key].isNewItem === 'false') {
              } else {
                if (data[key]?.isActive === 'true') {
                  db.ref(key + '/isNewItem').set('false');
                } else {
                  this.createRealtime(key);

                  const device = await this._deviceService.findOne({
                    deviceId: key,
                  });

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
                      isNewItem: 'false',
                      m15: '',
                      h1: '',
                      h6: '',
                      h12: '',
                      h24: '',
                      w1: '',
                      m1: '',
                      totalTimeOn: '',
                      energy: ''
                    });
                  }
                }
              }
            }
          }
        }
      });
    }, 5000);
  }

  private createRealtime = (key: string) => {
    let isConnectedG = 'false';
    let startTime = 0;

    const db = admin.database();

    const refTurnOnOff = db.ref(key + '/isTurnOn');
    const refConnect = db.ref(key + '/isConnected');
    const refEnergy = db.ref(key + '/energy');
    const refStartTime = db.ref(key + '/startTime');
    const ref15m = db.ref(key + '/m15');
    const ref1h = db.ref(key + '/h1');
    const ref6h = db.ref(key + '/h6');
    const ref12h = db.ref(key + '/h12');
    const ref24h = db.ref(key + '/h24');
    const ref1w = db.ref(key + '/w1');
    const ref1M = db.ref(key + '/m1');

    refConnect.ref.on('value', async (snapshot) => {
      const isConnected = snapshot.val();

      isConnectedG = isConnected;

      if (isConnected === 'true') {
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
    });

    refTurnOnOff.ref.on('value', async (snapshot) => {
      const isTurnOn = snapshot.val();

      if (isTurnOn === 'true' && isConnectedG === 'true') {
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

      if (isTurnOn === 'false' && isConnectedG === 'true') {
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
    });

    refEnergy.ref.on('value', async (snapshot) => {
      const energy = snapshot.val();

      let valueEnrgy: any = {};
      energy.split(',').forEach((item: string, index: number) => {
        if (index === 0) {
          valueEnrgy[item.split(':')[0].split('{')[1]] = item.split(':')[1];
        }

        if (item !== '}') {
          valueEnrgy[item.split(':')[0]] = item.split(':')[1];
        }
      });

      const now = new Date().getTime();

      console.log('now - startTime', startTime, now - startTime);

      const timeVal = now - startTime;

      if (timeVal < 15 * 60 * 1000) {
        await ref15m.ref.set(energy);
      }

      if (timeVal < 60 * 60 * 1000 && timeVal > 15 * 60 * 1000) {
        await ref1h.ref.set(energy);
      }

      if (timeVal < 6 * 60 * 60 * 1000 && timeVal > 60 * 60 * 1000) {
        await ref6h.ref.set(energy);
      }

      if (timeVal < 12 * 60 * 60 * 1000 && timeVal > 6 * 60 * 60 * 1000 ) {
        await ref12h.ref.set(energy);
      }

      if (timeVal < 24 * 60 * 60 * 1000 && timeVal > 12 * 60 * 60 * 1000) {
        await ref24h.ref.set(energy);
      }

      if (timeVal <  7 * 24 * 60 * 60 * 1000 && timeVal >  24 * 60 * 60 * 1000) {
        await ref1w.ref.set(energy);
      }

      if (timeVal < 30 * 24 * 60 * 60 * 1000 && timeVal >  7 * 24 * 60 * 60 * 1000) {
        await ref1M.ref.set(energy);
      }
    });

    refStartTime.ref.on('value', async (snapshot) => {
      const val = snapshot.val();

      console.log(startTime);

      startTime = val;
    });
  };
}
