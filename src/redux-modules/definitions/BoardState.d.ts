
export default interface BoardState {
  author: string | null;
  title: string | null;
  size: number;
  clues: {
    across: string[];
    down: string[];
  };
  grid: string[];
  cursor: number | null;
  isCursorAcross: boolean;
}
