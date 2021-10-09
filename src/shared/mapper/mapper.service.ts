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
      .createMap('UserV2', 'UserV2Vm')
      .forSourceMember(
        'fullname',
        (otps) =>
          otps.sourceObject.firstName + 'cc' + otps.sourceObject.lastName,
      )
      .forSourceMember('_id', (opts) => opts.ignore())
      .forSourceMember('password', (otps) => otps.ignore());

    config
      .createMap('DeviceEspV2', 'DeviceEspV2Vm')
      .forSourceMember('_id', (opts) => opts.ignore());
    // config
    //   .createMap('Todo[]', 'TodoVm[]')
    //   .forSourceMember('_id', (opts) => opts.ignore());

    // config
    //   .createMap('News[]', 'NewsVm[]')
    //   .forSourceMember('_id', (otps) => otps.ignore());
  }
}
