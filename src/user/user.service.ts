import {
  Injectable,
  HttpException,
  HttpStatus,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
// import * as admin from 'firebase-admin';

import { RegisterVm } from './models/register-vm.model';
import { UserVm } from './models/user-vm.model';
import { LoginVm } from './models/login-vm.model';
import { LoginResponseVm } from './models/login-response-cm.model';
import { MapperService } from 'src/shared/mapper/mapper.service';
import { JwtPayload } from 'src/shared/auth/jwt.payload';
import { AuthService } from 'src/shared/auth/auth.service';
import { UpdateUserVm } from './models/user.dto';
import { UserRepository } from './user.repository';
import { BaseService } from '../shared/base.service';
import { User } from './models/user.model';

@Injectable()
export class UserService extends BaseService<User> {
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

  // private async createUserFirebase(userId: string) {
  //   if (!userId) {
  //     throw new Error('CustomerId is not be null');
  //   }

  //   await admin.auth().createUser({ uid: userId });
  // }

  // private async setCustomerClaim(custemerId: string, customClaim = {}) {
  //   if (!custemerId) {
  //     throw new Error('CustomerId is not be null');
  //   }

  //   const customClaims = {
  //     admin: true,
  //     ...customClaim,
  //   };
  //   try {
  //     await admin.auth().createCustomToken(custemerId);
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   // await admin.auth().setCustomUserClaims(custemerId, customClaims);
  // }

  async register(register: RegisterVm): Promise<UserVm> {
    const { username, password, email } = register;

    const newUser = this._repository.createModel();
    newUser.username = username;
    newUser.email = email;

    const salt = 10;
    newUser.password = await hash(password, salt);

    try {
      const result = await this._repository.create(newUser);

      const userVm = (await this.map<UserVm>(result.toJSON())) as UserVm;

      // await this.createUserFirebase(userVm.id);

      return userVm;
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

    // await this.createUserFirebase(userVm.id);

    // await this.setCustomerClaim(userVm.id);

    return {
      token,
      user: userVm,
    };
  }

  async getUser(userId: string): Promise<UserVm> {
    try {
      const users = await this.userRepository.findById(userId).exec();

      if (!users) {
        throw new HttpException("User dostn't not found", HttpStatus.NOT_FOUND);
      }

      return this.map<UserVm>(users);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUser(updateUser: UpdateUserVm, userId: string): Promise<UserVm> {
    const firstname = updateUser?.firstname;
    const lastname = updateUser?.lastname;

    try {
      const user = await this._repository.findById(userId);
      if (firstname) user.firstName = firstname;

      if (lastname) user.lastName = lastname;

      const savedUser = await this._repository.updateById(userId, user);

      return this.map<UserVm>(savedUser);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
