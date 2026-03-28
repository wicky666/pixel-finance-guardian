import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { parseSessionId } from "./auth.guard";

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
  async register(@Body() body: RegisterDto) {
    return { user: await this.auth.register(body.email, body.password) };
  }

  @Post("login")
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(body.email, body.password);
    setSessionCookie(res, result.sessionId, result.expiresAt);
    return { user: result.user, expiresAt: result.expiresAt };
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sid = parseSessionId(req.headers.cookie);
    if (sid) await this.auth.logout(sid);
    clearSessionCookie(res);
    return { ok: true };
  }

  @Get("me")
  async me(@Req() req: Request) {
    const sid = parseSessionId(req.headers.cookie);
    const user = await this.auth.getUserBySession(sid);
    return { user };
  }
}
