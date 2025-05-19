export interface Answer {
  id: number;
  content: string;
  createdAt: Date;
  questionId: number;
  userid: number;
  question?: {
    id: number;
    title: string;
    description?: string;
    anonymous: boolean;
    status: string;
    createdAt: Date;
    voteCount: number;
    sessionId: number;
    userId: number;
  };
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
