export type UserRole = "user" | "admin" | "super_admin";

export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: "active" | "blocked";
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface SafeUser {
  id: string;
  email: string;
  role: UserRole;
  status: "active" | "blocked";
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}
