
export enum UserRole {
    ADMIN = 'ADMIN',
    TEAM_LEAD = 'TEAM_LEAD',
    DEVELOPER = 'DEVELOPER',
    DESIGNER = 'DESIGNER',
    DM = 'DM',
    USER = 'USER'
}

export enum TicketStatus {
    OPEN = 'Open',
    IN_PROGRESS = 'In_Progress',
    REVIEW = 'Review',
    COMPLETED = 'Completed'
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
    assignee?: number; // Integer in DB
    assignee_name?: string;
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
