import {
  Injectable,
  HttpException,
  HttpStatus,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

import { RegisterVm } from './models/register-vm.model';
import { UserVm } from './models/user-vm.model';
import { LoginVm } from './models/login-vm.model';
import { LoginResponseVm } from './models/login-response-cm.model';
import { MapperService } from 'src/shared/mapper/mapper.service';
import { JwtPayload } from 'src/shared/auth/jwt.payload';
import { AuthService } from 'src/shared/auth/auth.service';
import { GetUserVm, UpdateUserVm } from './models/user.dto';
import { UserRepository } from './user.repository';
import { BaseServiceV2 } from '../shared/base.service.v2';
import { UserV2 } from './models/user.model.v2';

@Injectable()
export class UserServiceV2 extends BaseServiceV2<UserV2> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly _mapperService: MapperService,
    @Inject(forwardRef(() => AuthService))
    private readonly _authService: AuthService,
  ) {
    super();

    this._repository = userRepository;
    this._mapper = _mapperService.mapper;
  }

  async register(register: RegisterVm): Promise<UserVm> {
    const { username, password, email } = register;

    const newUser = this._repository.createModel();
    newUser.username = username;
    newUser.email = email;

    const salt = 10;
    newUser.password = await hash(password, salt);

    try {
      const result = await this._repository.create(newUser);

      return (await this.map<UserVm>(result.toJSON())) as UserVm;
    } catch (e) {
      //MongoError
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(login: LoginVm): Promise<LoginResponseVm> {
    const { username, password } = login;

    const user = await this._repository.findOne({ username });

    if (!user) {
      throw new HttpException('Invalid creadentials', HttpStatus.BAD_REQUEST);
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new HttpException('Invalid creadentials', HttpStatus.BAD_REQUEST);
    }

    const payload: JwtPayload = {
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = await this._authService.signPayload(payload);

    const userVm: UserVm = await this.map<UserVm>(user);

    return {
      token,
      user: userVm,
    };
  }

  async getUser(): Promise<UserVm> {
    try {
      const users = await this.userRepository
        .findById('61615ea605feaf8fa9d2e5a2')
        .populate(
          'devicesEsp',
          'deviceName deviceId isConnected',
          'DeviceEspV2',
        )
        .exec();

      if (!users) {
        throw new HttpException("User dostn't not found", HttpStatus.NOT_FOUND);
      }

      return this.map<UserVm>(users);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
