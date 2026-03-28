import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

function parseSessionId(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;
  const key = process.env.SESSION_COOKIE_NAME ?? "pfg_session";
  const chunks = cookieHeader.split(";").map((part) => part.trim());
  for (const chunk of chunks) {
    const [k, ...rest] = chunk.split("=");
    if (k === key) return decodeURIComponent(rest.join("="));
  }
  return null;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined>; user?: unknown }>();
    const sid = parseSessionId(req.headers?.cookie);
    const user = await this.auth.getUserBySession(sid);
    if (!user) {
      throw new UnauthorizedException("请先登录");
    }
    req.user = user;
    return true;
  }
}

export { parseSessionId };
