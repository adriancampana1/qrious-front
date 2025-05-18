export interface CreateSessionDto {
  title: string;
  description: string;
  userLimit?: number;
  activeFrom: string;
  activeTo: string;
}
