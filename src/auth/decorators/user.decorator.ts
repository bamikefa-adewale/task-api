import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.sub;
  },
);





// import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// import { REQUEST_USER_KEY } from '../constants/auth.constant';
// import { ActiveUserData } from 'src/interfaces/active-user.interface';

// export const GetUserId = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext): string => {
//     const request = ctx.switchToHttp().getRequest();

//     // Prefer normalized user set by the access token guard
//     const user = (request[REQUEST_USER_KEY] as Partial<ActiveUserData> | undefined) ?? request.user;

//     const id = user?.sub ?? (user as any)?.userId ?? (user as any)?.id;

//     if (!id) {
//       throw new UnauthorizedException('User id not found in request');
//     }

//     return id;
//   },
// );

