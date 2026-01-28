
export enum UserRole {
  ADMIN = 'ADMIN',
  TEAM_LEAD = 'TEAM_LEAD',
  DEVELOPER = 'DEVELOPER',
  DESIGNER = 'DESIGNER',
  DM = 'DM',
  USER = 'USER'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  month: string;
  year: number;
  userId?: number; // Integer in DB
  status: TicketStatus;
  createdAt: string;
}

export interface TicketUpdate {
  id: number;
  ticketId: number;
  updateText: string;
  screenshotPath: string;
  createdAt: string;
  userName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}
