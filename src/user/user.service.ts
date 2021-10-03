import { ModelType, InstanceType } from 'typegoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BaseService } from './../shared/base.service';
import { User } from './models/user.model';
import { RegisterVm } from './models/register-vm.model';
import { UserVm } from './models/user-vm.model';
import { LoginVm } from './models/login-vm.model';
import { LoginResponseVm } from './models/login-response-cm.model';
import { MapperService } from 'src/shared/mapper/mapper.service';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectModel(User.modelName)
    private readonly _userModal: ModelType<InstanceType<User>>,
    private readonly _mapperService: MapperService,
  ) {
    super();
    this._mapper = _mapperService.mapper;
    this._model = _userModal;
  }

  async register(register: RegisterVm): Promise<User> {
    const { username, password, firstName, lastName } = register;

    const newUser = new this._model();
    newUser.username = username;
    newUser.firstName = firstName;
    newUser.lastName = lastName;

    const salt = 10;
    // newUser.password = await hash(password, salt);

    try {
      const result = await this.create(newUser);

      return result.toJSON() as User;
    } catch (e) {
      //MongoError
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(login: LoginVm): Promise<LoginResponseVm> {
    const { username, password } = login;

    const user = await this.findOne({ username });

    console.log('user', user);

    if (!user) {
      throw new HttpException('Invalid creadentials', HttpStatus.BAD_REQUEST);
    }

    // const isMatch = await compare(password, user.password);

    // if (!isMatch) {
    //     throw new HttpException('Invalid creadentials', HttpStatus.BAD_REQUEST);
    // }

    // const payload: JwtPayload = {
    //     username: user.username,
    // };

    // const token = await this._authService.signPayload(payload);//user.toJSON()
    // this.mapper.createMap(User, UserVm);

    const userVm: UserVm = await this.map<UserVm>(user.toJSON());

    console.log('userVm', userVm);

    return {
      token: '',
      user: userVm,
    };
  }
}
