import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as admin from 'firebase-admin';
import { DeviceRepository } from 'src/devices/devices.repository';
import { ConfigurationsService } from 'src/shared/configurations/configurations.service';

const ServiceAccount = require('../../../smart-home-87480-firebase-adminsdk-295mc-19be7d9e07.json');

@Injectable()
export class FirebaseService {
  private readonly serviceAccount = ServiceAccount;

  constructor(
    private readonly _deviceService: DeviceRepository,
    private readonly _configuration: ConfigurationsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.configurationFirebase();
  }

  private configurationFirebase() {
    admin.initializeApp({
      credential: admin.credential.cert(this.serviceAccount),
      databaseURL: this._configuration.get('DATA_BASE_URL_FIREBASE'),
    });

    const db = admin.database();

    //ref with id esp
    const ref = db.ref();

    ref.on('value', async (snapshot) => {
      const data = snapshot.val();

      if (data) {
        for (const key in data) {
          if (data[key]?.isActive === 'true') {
            console.log(`ESP ${key} isCONNECTED: ${data[key]?.isActive}`);
          } else {
            console.log('Firebase Data: ', data);

            const device = await this._deviceService.findOne({ deviceId: key });
            if (!device) {
              //recheck
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
              // db.ref(key + '/isConnected').set('true'); // update client(app) + update esp (if neccessary)
            }
          }

          if (data[key]?.isConnected === 'true') {
            const device = await this._deviceService.findOne({ deviceId: key });

            device.isConnected = true;
            await this._deviceService.updateById(device.id, device);
          } else {
            const device = await this._deviceService.findOne({ deviceId: key });

            device.isConnected = false;
            await this._deviceService.updateById(device.id, device);
          }

          if (
            data[key]?.isTurnOn === 'true' &&
            data[key]?.isConnected === 'true'
          ) {
            const device = await this._deviceService.findOne({ deviceId: key });

            device.isTurnOn = true;
            await this._deviceService.updateById(device.id, device);
          }

          if (
            data[key]?.isTurnOn === 'false' &&
            data[key]?.isConnected === 'true'
          ) {
            const device = await this._deviceService.findOne({ deviceId: key });

            device.isTurnOn = false;
            await this._deviceService.updateById(device.id, device);
          }
        }
      }
    });
  }

  pushSpecificNotifyIos(title: string, deviceToken: string) {
    const ios = {
      headers: {
        'apns-priority': this._configuration.get('apnsPriorityIos'),
        'apns-expiration': this._configuration.get('apnsExpiration'),
      },
      payload: {
        aps: {
          alert: {
            title,
          },
          badge: 1,
          sound: this._configuration.get('sound'),
        },
      },
    };

    const message = {
      apns: ios,
      token: deviceToken,
    };

    admin
      .messaging()
      .send(message)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  pushSpecificNotifyAndoird(
    title: string,
    content: string,
    deviceToken: string,
  ) {
    const android = {
      ttl: 36000,
      data: {
        title: title,
        content: content,
      },
    };

    const message = {
      android,
      token: deviceToken,
    };

    admin
      .messaging()
      .send(message)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  }
}
