import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// استخدام: findAll(@CurrentUser() user: JwtPayload)
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
