import { Injectable, InternalServerErrorException } from "@nestjs/common";
import type { SafeUser, UserRole } from "./auth.types";
// Avoid adding extra dependency for pg typings in this repo.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Pool } = require("pg") as { Pool: new (config: Record<string, unknown>) => any };
type PoolClient = any;


interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: "active" | "blocked";
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

interface SessionJoinRow {
  session_id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
  revoked_at: string | null;
  id: string;
  email: string;
  role: UserRole;
  status: "active" | "blocked";
  user_created_at: string;
  user_updated_at: string;
  last_login_at: string | null;
}

export interface SessionWithUser {
  sessionId: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
  user: SafeUser;
}

@Injectable()
export class AuthRepository {
  private readonly pool: PoolClient;

  constructor() {
    const connectionString = process.env.DATABASE_URL?.trim();
    if (!connectionString) {
      throw new InternalServerErrorException("DATABASE_URL 未配置，Auth 无法使用持久化存储");
    }

    this.pool = new Pool({
      connectionString,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DB_POOL_MAX ?? 10),
    });
  }

  private toSafeUser(row: Pick<UserRow, "id" | "email" | "role" | "status" | "created_at" | "updated_at" | "last_login_at">): SafeUser {
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
    };
  }

  async ensureTables(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        revoked_at TIMESTAMPTZ
      );
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY,
        actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(80) NOT NULL,
        detail_json JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }

  async findUserByEmail(email: string): Promise<(SafeUser & { passwordHash: string }) | null> {
    const { rows } = await this.pool.query(
      `SELECT id, email, password_hash, role, status, created_at, updated_at, last_login_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );
    const row = (rows as UserRow[])[0];
    if (!row) return null;
    return { ...this.toSafeUser(row), passwordHash: row.password_hash };
  }

  async findUserById(id: string): Promise<SafeUser | null> {
    const { rows } = await this.pool.query(
      `SELECT id, email, role, status, created_at, updated_at, last_login_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    const row = (rows as UserRow[])[0];
    return row ? this.toSafeUser(row) : null;
  }

  async createUser(email: string, passwordHash: string, role: UserRole = "user"): Promise<SafeUser> {
    const { rows } = await this.pool.query(
      `INSERT INTO users (email, password_hash, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'active', now(), now())
       RETURNING id, email, role, status, created_at, updated_at, last_login_at`,
      [email, passwordHash, role]
    );
    return this.toSafeUser((rows as UserRow[])[0]);
  }

  async createSession(sessionId: string, userId: string, expiresAt: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO auth_sessions (id, user_id, expires_at, created_at)
       VALUES ($1, $2, $3, now())`,
      [sessionId, userId, expiresAt]
    );
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.pool.query(
      `UPDATE auth_sessions SET revoked_at = now() WHERE id = $1`,
      [sessionId]
    );
  }

  async revokeAllSessionsByUser(userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE auth_sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
  }

  async getSessionWithUser(sessionId: string): Promise<SessionWithUser | null> {
    const { rows } = await this.pool.query(
      `SELECT
         s.id AS session_id,
         s.user_id,
         s.expires_at,
         s.created_at,
         s.revoked_at,
         u.id,
         u.email,
         u.role,
         u.status,
         u.created_at AS user_created_at,
         u.updated_at AS user_updated_at,
         u.last_login_at
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = $1
       LIMIT 1`,
      [sessionId]
    );
    const row = (rows as SessionJoinRow[])[0];
    if (!row) return null;
    return {
      sessionId: row.session_id,
      userId: row.user_id,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      revokedAt: row.revoked_at,
      user: {
        id: row.id,
        email: row.email,
        role: row.role,
        status: row.status,
        createdAt: row.user_created_at,
        updatedAt: row.user_updated_at,
        lastLoginAt: row.last_login_at,
      },
    };
  }

  async touchLastLogin(userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1`,
      [userId]
    );
  }

  async listUsers(): Promise<SafeUser[]> {
    const { rows } = await this.pool.query(
      `SELECT id, email, role, status, created_at, updated_at, last_login_at
       FROM users
       ORDER BY created_at DESC`
    );
    return (rows as UserRow[]).map((row: UserRow) => this.toSafeUser(row));
  }

  async updateUserRole(userId: string, role: UserRole): Promise<SafeUser | null> {
    const { rows } = await this.pool.query(
      `UPDATE users
       SET role = $2, updated_at = now()
       WHERE id = $1
       RETURNING id, email, role, status, created_at, updated_at, last_login_at`,
      [userId, role]
    );
    const row = (rows as UserRow[])[0];
    return row ? this.toSafeUser(row) : null;
  }

  async updateUserStatus(userId: string, status: "active" | "blocked"): Promise<SafeUser | null> {
    const { rows } = await this.pool.query(
      `UPDATE users
       SET status = $2, updated_at = now()
       WHERE id = $1
       RETURNING id, email, role, status, created_at, updated_at, last_login_at`,
      [userId, status]
    );
    const row = (rows as UserRow[])[0];
    return row ? this.toSafeUser(row) : null;
  }

  async countSuperAdmins(): Promise<number> {
    const { rows } = await this.pool.query(
      `SELECT COUNT(*)::text AS count FROM users WHERE role = 'super_admin'`
    );
    return Number((rows as Array<{ count: string }>)[0]?.count ?? "0");
  }

  async addActivityLog(params: {
    id: string;
    actorUserId: string | null;
    targetUserId: string | null;
    action: string;
    detailJson: Record<string, unknown>;
  }): Promise<void> {
    await this.pool.query(
      `INSERT INTO activity_logs (id, actor_user_id, target_user_id, action, detail_json, created_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, now())`,
      [
        params.id,
        params.actorUserId,
        params.targetUserId,
        params.action,
        JSON.stringify(params.detailJson),
      ]
    );
  }
}
