import 'automapper-ts/dist/automapper';

import { Injectable } from '@nestjs/common';

@Injectable()
export class MapperService {
  mapper: AutoMapperJs.AutoMapper;

  constructor() {
    this.mapper = automapper;
    this.initializeMapper();
  }

  private initializeMapper(): void {
    this.mapper.initialize(MapperService.configure);
  }

  private static configure(config: AutoMapperJs.IConfiguration): void {
    config
      .createMap('User', 'UserVm')
      // .forSourceMember(
      //   'fullname',
      //   (otps) =>
      //     otps.sourceObject.firstName + 'cc' + otps.sourceObject.lastName,
      // )
      .forSourceMember('_id', (opts) => opts.ignore())
      .forSourceMember('password', (otps) => otps.ignore());

    config
      .createMap('DeviceEsp', 'DeviceEspVm')
      .forSourceMember('_id', (opts) => opts.ignore());
    config
      .createMap('DeviceEsp[]', 'DeviceEspVm[]')
      .forSourceMember('_id', (opts) => opts.ignore());
  }
}
