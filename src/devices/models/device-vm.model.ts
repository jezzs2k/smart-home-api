import { ApiProperty } from '@nestjs/swagger';

import { BaseModelVm } from 'src/shared/base.model';

export class DeviceVm extends BaseModelVm {
  @ApiProperty()
  deviceName?: string;

  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  deviceType?: string;

  @ApiProperty()
  isConnected?: boolean;

  @ApiProperty()
  isTurnOn?: boolean;
}
