import Dictionary from 'definitions/Dictionary';
import { LensImpl } from 'lens.ts';
import { Store } from 'lib/createStateContext';
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

export const toggleDirection = () => <T>(store: Store<T>, lens: LensImpl<T, BoardState>) => {
  store.update(lens.k('direction').set(direction => flipMap[direction])(store.state));
};

export const setCursor = (cursor: number) => <T>(store: Store<T>, lens: LensImpl<T, BoardState>) => {
  store.update(lens.k('cursor').set(cursor)(store.state));
};
