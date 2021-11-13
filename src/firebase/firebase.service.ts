import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigurationsService } from 'src/shared/configurations/configurations.service';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';

@Injectable()
export class FirebaseService {
  constructor(
    private readonly _configuration: ConfigurationsService,
    private readonly cacheManager: RedisCacheService,
  ) {}

  async handleOnOffDevice(deviceId: string, value: string) {
    const db = admin.database();
    await this.cacheManager.set('isRunAllRealTime', false);

    const ref = db.ref(deviceId + '/isTurnOn');

    ref.set(value);
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
      data: {
        title: title,
        content: content,
      },
    };

    const message = {
      android,
      apns: {
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
      },
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
