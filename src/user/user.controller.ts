import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApiException } from 'src/shared/api-exception.model';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { GetOperationId } from 'src/shared/utilities/get-operation-id';
import { LoginResponseVm } from './models/login-response-cm.model';
import { LoginVm } from './models/login-vm.model';
import { RegisterVm } from './models/register-vm.model';
import { UserRole } from './models/user-role.enum';
import { UserVm } from './models/user-vm.model';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { DeleteDeviceVm, GetUserVm, UpdateUserVm } from './models/user.dto';
import { GetUser } from 'src/shared/decorators/getUser.decorator';

@Controller('user')
@ApiTags(User.modelName)
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Post('login')
  @ApiResponse({ status: HttpStatus.CREATED, type: LoginResponseVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId(User.modelName, 'Login'))
  async login(@Body() loginVm: LoginVm): Promise<LoginResponseVm> {
    const fields = Object.keys(loginVm);

    fields.forEach((field) => {
      if (!loginVm[field]) {
        throw new HttpException(`${field} is required`, HttpStatus.BAD_REQUEST);
      }
    });

    return this._userService.login(loginVm);
  }

  @Post('register')
  @ApiResponse({ status: HttpStatus.CREATED, type: UserVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId(User.modelName, 'Register'))
  async register(@Body() registerVm: RegisterVm): Promise<UserVm> {
    const fields = Object.keys(registerVm);

    fields.forEach((field) => {
      if (!registerVm[field]) {
        throw new HttpException(`${field} is required`, HttpStatus.BAD_REQUEST);
      }
    });

    const { username } = registerVm;

    let exist;

    try {
      exist = await this._userService.findOne({ username });
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (exist) {
      throw new HttpException(`${username} exists`, HttpStatus.BAD_REQUEST);
    }

    return await this._userService.register(registerVm);
  }

  @Get('/')
  @ApiBearerAuth()
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.CREATED, type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId(User.modelName, 'Get user'))
  async getUser(@GetUser() userPayload: User): Promise<UserVm> {
    const userId = userPayload.id;

    if (!userId) {
      throw new HttpException('User id must provide !', HttpStatus.BAD_REQUEST);
    }

    const user = await this._userService.getUser(userId);

    return user;
  }

  @Put('/')
  @ApiBearerAuth()
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.CREATED, type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId(User.modelName, 'Update user'))
  async updateUser(
    @Body() updateUserVm: UpdateUserVm,
    @GetUser() userPayload: User,
  ): Promise<UserVm> {
    const userId = userPayload.id;

    try {
      const user = await this._userService.findById(userId);

      if (!user) {
        throw new HttpException("Can't not find user!", HttpStatus.NOT_FOUND);
      }
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!updateUserVm) {
      throw new HttpException(
        'Params id must provide !',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this._userService.updateUser(updateUserVm, userId);

    return user;
  }

  @Delete('/device')
  @ApiBearerAuth()
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.CREATED, type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId(User.modelName, 'Delete device'))
  async deleteDevice(
    @Body() deleteDeviceVm: DeleteDeviceVm,
    @GetUser() userPayload: User,
  ): Promise<UserVm> {
    const userId = userPayload.id;
    const deviceId = deleteDeviceVm?.deviceEspId;

    if (!deviceId) {
      throw new HttpException(
        'Device id must provide !',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const user = this._userService.deleteDevice(deviceId, userId);

      return user;
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
