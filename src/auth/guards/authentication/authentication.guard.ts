import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from 'src/auth/decorators/public.decoraator';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AUTH_TYPE_KEY } from 'src/auth/constants/auth.constant';
import { AuthType } from 'src/auth/enums/auth-types.enum';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthTypes = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  >;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip guard for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    // Get auth types from reflector
    const authTypes = this.reflector.getAllAndOverride(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [AuthenticationGuard.defaultAuthTypes];
    // Get guards for each auth type array of guards
    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();

    const error = new UnauthorizedException();
    // Try each guard
    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err) => {
        error: err;
      });
      console.log('this is auth guard', canActivate);

      if (canActivate) {
        return true;
      }
    }

    throw error;
  }
}
