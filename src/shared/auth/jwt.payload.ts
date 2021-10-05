import { UserRole } from 'src/user/models/user-role.enum';

export interface JwtPayload {
  username: string;
  email: string;
  role: UserRole;
  iat?: Date;
}
