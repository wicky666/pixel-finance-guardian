import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import type { AuthUser, SafeUser, SessionRecord, UserRole } from "./auth.types";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class AuthService {
  private users: AuthUser[] = [];
  private sessions: SessionRecord[] = [];

  constructor() {
    const seedEmail = process.env.SUPER_ADMIN_EMAIL?.trim();
    const seedPassword = process.env.SUPER_ADMIN_PASSWORD?.trim();
    if (seedEmail && seedPassword) {
      const now = new Date().toISOString();
      this.users.push({
        id: randomUUID(),
        email: normalizeEmail(seedEmail),
        passwordHash: this.hashPassword(seedPassword),
        role: "super_admin",
        status: "active",
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null,
      });
    }
  }

  private hashPassword(password: string): string {
    const secret = process.env.AUTH_SECRET ?? "pfg-dev-secret";
    return createHash("sha256").update(`${secret}:${password}`).digest("hex");
  }

  private isSameHash(left: string, right: string): boolean {
    const l = Buffer.from(left, "utf8");
    const r = Buffer.from(right, "utf8");
    if (l.length !== r.length) return false;
    return timingSafeEqual(l, r);
  }

  private toSafeUser(user: AuthUser): SafeUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  register(email: string, password: string): SafeUser {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail.includes("@")) {
      throw new BadRequestException("邮箱格式不正确");
    }
    if (password.length < 8) {
      throw new BadRequestException("密码至少 8 位");
    }
    const exists = this.users.find((u) => u.email === normalizedEmail);
    if (exists) {
      throw new BadRequestException("该邮箱已注册");
    }
    const now = new Date().toISOString();
    const user: AuthUser = {
      id: randomUUID(),
      email: normalizedEmail,
      passwordHash: this.hashPassword(password),
      role: "user",
      status: "active",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    };
    this.users = [user, ...this.users];
    return this.toSafeUser(user);
  }

  login(email: string, password: string): { user: SafeUser; sessionId: string; expiresAt: string } {
    const normalizedEmail = normalizeEmail(email);
    const user = this.users.find((u) => u.email === normalizedEmail);
    if (!user) {
      throw new UnauthorizedException("邮箱或密码错误");
    }
    if (user.status === "blocked") {
      throw new UnauthorizedException("账号已被禁用");
    }
    const hashed = this.hashPassword(password);
    if (!this.isSameHash(user.passwordHash, hashed)) {
      throw new UnauthorizedException("邮箱或密码错误");
    }

    const now = Date.now();
    const session: SessionRecord = {
      id: randomUUID(),
      userId: user.id,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    };
    user.lastLoginAt = new Date(now).toISOString();
    user.updatedAt = user.lastLoginAt;
    this.sessions = [session, ...this.sessions.filter((s) => s.userId !== user.id)];
    return { user: this.toSafeUser(user), sessionId: session.id, expiresAt: session.expiresAt };
  }

  logout(sessionId: string): void {
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
  }

  getUserBySession(sessionId?: string | null): SafeUser | null {
    if (!sessionId) return null;
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      this.logout(session.id);
      return null;
    }
    const user = this.users.find((u) => u.id === session.userId);
    if (!user || user.status !== "active") return null;
    return this.toSafeUser(user);
  }

  listUsers(): SafeUser[] {
    return this.users.map((u) => this.toSafeUser(u));
  }

  updateUserRole(actor: SafeUser, userId: string, role: UserRole): SafeUser {
    if (actor.role !== "super_admin") {
      throw new UnauthorizedException("只有 super_admin 可以调整角色");
    }
    const target = this.users.find((u) => u.id === userId);
    if (!target) {
      throw new BadRequestException("用户不存在");
    }
    target.role = role;
    target.updatedAt = new Date().toISOString();
    return this.toSafeUser(target);
  }

  updateUserStatus(actor: SafeUser, userId: string, status: "active" | "blocked"): SafeUser {
    if (actor.role === "user") {
      throw new UnauthorizedException("权限不足");
    }
    const target = this.users.find((u) => u.id === userId);
    if (!target) {
      throw new BadRequestException("用户不存在");
    }
    if (target.role === "super_admin" && actor.role !== "super_admin") {
      throw new UnauthorizedException("无权变更 super_admin 状态");
    }
    target.status = status;
    target.updatedAt = new Date().toISOString();
    if (status === "blocked") {
      this.sessions = this.sessions.filter((s) => s.userId !== target.id);
    }
    return this.toSafeUser(target);
  }
}
