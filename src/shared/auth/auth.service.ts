import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SignOptions, sign } from 'jsonwebtoken';
import { User } from '../../user/models/user.model';
import { UserRepository } from '../../user/user.repository';
import { Configuration } from '../configurations/configurations.enum';
import { ConfigurationsService } from '../configurations/configurations.service';
import { JwtPayload } from './jwt.payload';

@Injectable()
export class AuthService {
  private readonly jwtOption: SignOptions;
  private readonly jwtKey: string;

  constructor(
    @Inject(forwardRef(() => UserRepository))
    private readonly _userRepository: UserRepository,
    private readonly _configurationService: ConfigurationsService,
  ) {
    this.jwtOption = { expiresIn: '300h' };
    this.jwtKey = _configurationService.get(Configuration.JWT_KEY);
  }

  async signPayload(payload: JwtPayload): Promise<string> {
    return sign(payload, this.jwtKey, this.jwtOption);
  }

  async validatePayload(payload: JwtPayload): Promise<User> {
    return this._userRepository.findOne({
      username: payload.username.toLocaleLowerCase(),
    });
  }
}
