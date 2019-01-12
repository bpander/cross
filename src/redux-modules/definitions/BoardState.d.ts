import * as Enums from 'lib/crossword/Enums';

export default interface BoardState {
  letters: string[];
  cursor: number;
  direction: Enums.Direction;
}
