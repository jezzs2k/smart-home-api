import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserService } from 'src/user/user.service';

const ServiceAccount = require('../../../htcdt-iot-firebase-adminsdk-lvhlo-fbbe730e62.json');

@Injectable()
export class FirebaseService {
  private readonly serviceAccount = ServiceAccount;

  constructor(private readonly _userService: UserService) {
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

    ref.on('value', (snapshot) => {
      const data = snapshot.val();

      console.log(data);

      if (data?.getuser) {
        for (const key in data?.getuser) {
          if (data[key]?.isActive === 'true') {
            console.log('ok true');
          } else {
            db.ref(key + '/setUser').set('true');
            db.ref(key + '/isActive').set('true');
          }
          // if (data?.getuser[key] === 'true') {
          //   console.log('Tao co roi nhe buy');
          // } else {
          //   setTimeout(() => {
          //     db.ref('/user/' + key).set('23123123123123213123');
          //     db.ref('/getuser/' + key).set('true');
          //   }, 1000);
          // }
        }
      }
    });
  }

  private async handleGetUserByDeviceId(deviceId: string) {
    return new Promise((resolve, reject) => {
      // const user
    });
  }
}
