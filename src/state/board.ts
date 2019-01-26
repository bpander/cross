import Dictionary from 'definitions/Dictionary';
import * as Enums from 'lib/crossword/Enums';
import { Setter } from 'lib/lens';

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

export const toggleDirection: Setter<BoardState> = state => {
  return { ...state, direction: flipMap[state.direction] };
};

export const setCursor = (cursor: number): Setter<BoardState> => state => {
  return { ...state, cursor };
};
