import { ReactNode } from 'react';

export interface BaseUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  school_id: string;
}

export interface AuthUser extends BaseUser {
  role: 'admin' | 'principal' | 'vice_principal' | 'supervisor' | 'teacher';
}

export interface ComponentProps {
  children?: ReactNode;
  className?: string;
}
