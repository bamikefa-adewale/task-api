export interface ActiveUserData {
  sub: string;
  email: string;
  sessionId: string;
  role?: string;
  permissions?: string[];
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  iat?: number; // issued at time
  exp?: number; // expiration time
}
