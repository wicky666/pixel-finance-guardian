import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";
import type { SafeUser, UserRole } from "./auth.types";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;
    const req = context.switchToHttp().getRequest<{ user?: SafeUser }>();
    if (!req.user) throw new UnauthorizedException("请先登录");
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedException("权限不足");
    }
    return true;
  }
}
