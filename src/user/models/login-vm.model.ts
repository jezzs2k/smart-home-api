import { ApiProperty } from '@nestjs/swagger';

export class LoginVm {
  @ApiProperty() username: string;
  @ApiProperty() password: string;
}
