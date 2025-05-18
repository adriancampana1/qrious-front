export interface Session {
  id: number;
  title: string;
  description: string;
  userLimit: number | null;
  activeFrom: string;
  activeTo: string;
  createdAt: string;
  updatedAt: string;
  createdById: number;
}

export interface SessionWithRelations extends Session {
  createdBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  access?: {
    id: number;
    type: string;
    value: string;
  }[];
  questions?: {
    id: number;
    title: string;
    description: string;
    anonymous: boolean;
    status: string;
    voteCount: number;
    createdAt: string;
    userId: number;
    answers?: {
      id: number;
      content: string;
      createdAt: string;
      userid: number;
    };
    votes: {
      id: number;
      userId: number;
    };
  }[];
  sessionUsers?: {
    userId: number;
    role: string;
    joinedAt: string;
    removedAt: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  }[];
}
