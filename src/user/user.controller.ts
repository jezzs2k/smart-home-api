import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { LoginResponseVm } from './models/login-response-cm.model';
import { LoginVm } from './models/login-vm.model';
import { UserVm } from './models/user-vm.model';
import { User } from './models/user.model';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Post('login')
  // @UseInterceptors(MapInterceptor(UserVm, User))
  @ApiResponse({ status: HttpStatus.CREATED, type: LoginResponseVm })
  //   @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  // @ApiOperation(GetOperationId(User.modelName, 'Login'))
  async login(@Body() loginVm: LoginVm): Promise<LoginResponseVm> {
    const fields = Object.keys(loginVm);

    fields.forEach((field) => {
      if (!loginVm[field]) {
        throw new HttpException(`${field} is required`, HttpStatus.BAD_REQUEST);
      }
    });

    return this._userService.login(loginVm);
  }
}
