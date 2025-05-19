export interface Question {
  id: number;
  title: string;
  description?: string;
  anonymous: boolean;
  status: 'open' | 'closed';
  createdAt: Date;
  voteCount: number;
  sessionId: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  answers?: {
    id: number;
    content: string;
    createdAt: Date;
    userid: number;
  }[];
  votes?: {
    id: number;
    userId: number;
    createdAt: Date;
    questionId: number;
  }[];
}
