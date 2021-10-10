import * as cluster from 'cluster';
import * as os from 'os';
import { Injectable } from '@nestjs/common';

const numCPUs = os.cpus().length;

@Injectable()
export class AppClusterService {
  static clusterize(callback: Function): void {
    const clusterDemo: any = cluster;

    if (clusterDemo.isMaster) {
      console.log(`Master server started on ${process.pid}`);
      for (let i = 0; i < numCPUs - 4; i++) {
        clusterDemo.fork();
      }

      clusterDemo.on('online', function (worker) {
        console.log('Worker %s is online', worker.process.pid);

        worker.process.on('message', (msg) => {
          console.log('msg', msg);
        });
      });

      clusterDemo.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting`);
        clusterDemo.fork();
      });
    } else {
      console.log(`Cluster server started on ${process.pid}`);
      callback();
    }
  }
}
