import Dictionary from 'definitions/Dictionary';
import { Updater } from 'lib/createStore';
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

export const toggleDirection: Updater<BoardState> = l => () => {
  return l.k('direction').set(direction => flipMap[direction]);
};

export const setCursor: Updater<BoardState> = l => (cursor: number) => {
  return l.k('cursor').set(cursor);
};
