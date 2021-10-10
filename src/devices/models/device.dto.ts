import { ApiProperty } from '@nestjs/swagger';

export class DeviceUpdateEspVm {
  @ApiProperty()
  deviceName?: string;

  @ApiProperty()
  deviceType?: string;

  @ApiProperty({ default: false })
  isConnected?: boolean;
}
