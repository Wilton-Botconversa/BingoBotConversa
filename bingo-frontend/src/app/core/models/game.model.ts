export interface Game {
  id: number;
  status: string;
  drawMode: string;
  drawIntervalSeconds: number;
  drawnNumbers: number[];
  participantCount: number;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
}

export interface Participant {
  id: number;
  userId: number;
  name: string;
  email: string;
  profilePhotoUrl: string;
  joinedAt: string;
}

export interface CreateGameRequest {
  drawMode: string;
  drawIntervalSeconds: number;
}
