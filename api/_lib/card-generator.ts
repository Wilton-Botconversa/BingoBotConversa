const COLUMN_RANGES = [
  [1, 15],   // B
  [16, 30],  // I
  [31, 45],  // N
  [46, 60],  // G
  [61, 75]   // O
];

function shuffle(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickNumbers(min: number, max: number, count: number): number[] {
  const pool = [];
  for (let i = min; i <= max; i++) pool.push(i);
  return shuffle(pool).slice(0, count).sort((a, b) => a - b);
}

export interface CellData {
  rowIdx: number;
  colIdx: number;
  number: number;
}

export function generateCardCells(): CellData[] {
  const cells: CellData[] = [];
  for (let col = 0; col < 5; col++) {
    const [min, max] = COLUMN_RANGES[col];
    const numbers = pickNumbers(min, max, 5);
    for (let row = 0; row < 5; row++) {
      cells.push({ rowIdx: row, colIdx: col, number: numbers[row] });
    }
  }
  return cells;
}
