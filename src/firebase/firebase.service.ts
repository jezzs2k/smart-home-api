import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DeviceRepository } from 'src/devices/devices.repository';

const ServiceAccount = require('../../../htcdt-iot-firebase-adminsdk-lvhlo-fbbe730e62.json');

@Injectable()
export class FirebaseService {
  private readonly serviceAccount = ServiceAccount;

  constructor(private readonly _deviceService: DeviceRepository) {
    this.configurationFirebase();
  }

  private configurationFirebase() {
    admin.initializeApp({
      credential: admin.credential.cert(this.serviceAccount),
      databaseURL: 'https://htcdt-iot-default-rtdb.firebaseio.com/',
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
              db.ref(key).set({ isActive: true, setUser: device.createdBy.id });
              // db.ref(key + '/isConnected').set('true'); // update client(app) + update esp (if neccessary)
            }
          }

          if (data[key]?.isConnected === 'true') {
            const device = await this._deviceService.findOne({ deviceId: key });

            device.isConnected = true;
            await this._deviceService.updateById(device.id, device);
          }
        }
      }
    });
  }
}
