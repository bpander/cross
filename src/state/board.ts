import Dictionary from 'definitions/Dictionary';
import { LensImpl } from 'lens.ts';
import * as Enums from 'lib/crossword/Enums';

export interface BoardState {
  letters: string[];
  cursor: number;
  direction: Enums.Direction;
}

export const defaultValue: BoardState = {
  letters: [],
  cursor: 0,
  direction: Enums.Direction.Across,
};

const flipMap: Dictionary<Enums.Direction> = {
  [Enums.Direction.Across]: Enums.Direction.Down,
  [Enums.Direction.Down]: Enums.Direction.Across,
};

export const toggleDirection = () => <T>(lens: LensImpl<T, BoardState>) => {
  return lens.k('direction').set(direction => flipMap[direction]);
};

export const setCursor = (cursor: number) => <T>(lens: LensImpl<T, BoardState>) => {
  return lens.k('cursor').set(cursor);
};
