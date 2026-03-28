import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthGuard, parseSessionId } from "./auth.guard";
import { RolesGuard } from "./roles.guard";
import { Roles } from "./roles.decorator";
import type { SafeUser, UserRole } from "./auth.types";

function setSessionCookie(res: Response, sessionId: string, expiresAt: string) {
  const key = process.env.SESSION_COOKIE_NAME ?? "pfg_session";
  res.cookie(key, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    path: "/",
  });
}

function clearSessionCookie(res: Response) {
  const key = process.env.SESSION_COOKIE_NAME ?? "pfg_session";
  res.clearCookie(key, { path: "/" });
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() body: RegisterDto) {
    return { user: this.auth.register(body.email, body.password) };
  }

  @Post("login")
  login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = this.auth.login(body.email, body.password);
    setSessionCookie(res, result.sessionId, result.expiresAt);
    return { user: result.user, expiresAt: result.expiresAt };
  }

  @Post("logout")
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sid = parseSessionId(req.headers.cookie);
    if (sid) this.auth.logout(sid);
    clearSessionCookie(res);
    return { ok: true };
  }

  @Get("me")
  me(@Req() req: Request) {
    const sid = parseSessionId(req.headers.cookie);
    const user = this.auth.getUserBySession(sid);
    return { user };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @Get("users")
  listUsers() {
    return { items: this.auth.listUsers() };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("super_admin")
  @Post("users/:id/role")
  updateRole(@Req() req: Request & { user: SafeUser }, @Body() body: { userId: string; role: UserRole }) {
    return { item: this.auth.updateUserRole(req.user, body.userId, body.role) };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @Post("users/:id/status")
  updateStatus(@Req() req: Request & { user: SafeUser }, @Body() body: { userId: string; status: "active" | "blocked" }) {
    return { item: this.auth.updateUserStatus(req.user, body.userId, body.status) };
  }
}
