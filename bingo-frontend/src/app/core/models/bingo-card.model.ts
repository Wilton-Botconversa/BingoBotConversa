export interface BingoCard {
  id: number;
  gameId: number;
  userName: string;
  completed: boolean;
  completionRank: number | null;
  cells: CardCell[];
}

export interface CardCell {
  id: number;
  rowIdx: number;
  colIdx: number;
  number: number;
  drawn: boolean;
  confirmed: boolean;
}
