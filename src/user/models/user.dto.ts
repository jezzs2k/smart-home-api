import { ApiProperty } from '@nestjs/swagger';

export class GetUserVm {
  @ApiProperty() userId: string;
}

export class DeviceEspVm {
  @ApiProperty()
  deviceEspId?: string;

  @ApiProperty()
  deviceName?: string;

  @ApiProperty()
  deviceType?: string;

  @ApiProperty({ default: false })
  isConnected?: boolean;
}

export class UpdateUserVm {
  @ApiProperty() firstname?: string;
  @ApiProperty() lastname?: string;
  @ApiProperty() devicesEsp?: DeviceEspVm;
}

export class DeleteDeviceVm {
  @ApiProperty()
  deviceEspId?: string;
}
