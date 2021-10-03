import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

const ServiceAccount = require('/home/micheal/Documents/code/smart-home-api/htcdt-iot-firebase-adminsdk-lvhlo-fbbe730e62.json');

@Injectable()
export class FirebaseService {
  private readonly serviceAccount = ServiceAccount;

  constructor() {
    this.configurationFirebase();
  }

  private configurationFirebase() {
    admin.initializeApp({
      credential: admin.credential.cert(this.serviceAccount),
      databaseURL: 'https://htcdt-iot-default-rtdb.firebaseio.com/',
    });

    const db = admin.database();

    //ref theo id cua tung thiet bi esp
    const ref = db.ref('test/float');

    ref.set(11000, (e) => {
      console.log('e', e);
    });

    ref.on('value', (snapshot) => {
      console.log(snapshot.val());
    });

    ref.once('value', function (snapshot) {
      console.log(snapshot.val());
    });
  }
}
