import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  restaurantAssignments: string[];
  permissions: string[];
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
