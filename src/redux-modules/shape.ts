import groupBy from 'lodash/groupBy';
import { createSelector } from 'reselect';

import createReducer from 'lib/createReducer';
import { getSlots } from 'lib/crossword/shape';
import ShapeState from 'redux-modules/definitions/ShapeState';

const initialState: ShapeState = {
  width: 15,
  height: 15,
  blocks: [],
};

const { reducer, update } = createReducer<ShapeState>('shape/UPDATE', initialState);
export const shapeReducer = reducer;

export const shapeActions = {
  update,
};

export const shapeSelectors = {
  getSlots: createSelector(
    (state: ShapeState) => state,
    state => getSlots(state),
  ),

  getWordCounts: createSelector(
    getSlots,
    slots => groupBy(slots, slot => slot.cells.length),
  ),

  getCellToClueMap: createSelector(
    getSlots,
    slots => {
      const cellToClueMap: { [cell: number]: number } = {};
      slots.forEach(slot => {
        cellToClueMap[slot.cells[0]] = slot.clue;
      });
      return cellToClueMap;
    },
  ),
};
