// File: src/presentation/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // Після проходження JwtAuthGuard, passport автоматично інжектить об'єкт юзера
    return request.user?.userId;
  },
);
