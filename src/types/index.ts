export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  address: string;
  occupation: string;
  expertise: string;
  role: 'USER' | 'MENTOR' | 'ADMIN';
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface MentorshipSession {
  id: string;
  mentee: User;
  mentor: User;
  questions: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  scheduledAt: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  mentee: User;
  mentor: User;
  score: number;
  comment: string;
  isHidden: boolean;
  createdAt: string;
}
