export type Role = 'admin' | 'procurement' | 'normal' | 'approver';

export interface User {
  id: string;
  _id?: string;
  uid?: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface LoginResponse {
  token: string;
}
