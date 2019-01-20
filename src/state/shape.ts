import groupBy from 'lodash/groupBy';
import { createSelector } from 'reselect';

import * as shape from 'lib/crossword/shape';
import { CellToClueMap, Shape } from 'lib/crossword/Types';

export interface ShapeState extends Shape {}

export const defaultValue: ShapeState = {
  width: 15,
  height: 15,
  blocks: [],
};

export const getSlots = createSelector(
  (state: ShapeState) => state,
  state => shape.getSlots(state),
);

export const getWordCounts = createSelector(
  getSlots,
  slots => groupBy(slots, slot => slot.cells.length),
);

export const getCellToClueMap = createSelector(
  getSlots,
  slots => {
    const cellToClueMap: CellToClueMap = {};
    slots.forEach(slot => {
      cellToClueMap[slot.cells[0]] = slot.clue;
    });
    return cellToClueMap;
  },
);
