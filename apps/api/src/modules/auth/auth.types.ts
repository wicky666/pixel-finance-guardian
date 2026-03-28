export type UserRole = "user" | "admin" | "super_admin";

export interface SafeUser {
  id: string;
  email: string;
  role: UserRole;
  status: "active" | "blocked";
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}
