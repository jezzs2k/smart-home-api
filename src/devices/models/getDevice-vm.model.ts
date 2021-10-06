import { ApiProperty } from '@nestjs/swagger';

export class GetDeviceVm {
  @ApiProperty()
  deviceId: string;
}
