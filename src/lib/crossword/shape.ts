import groupBy from 'lodash/groupBy';

import { includes, times } from 'util/arrays';
import { values } from 'util/objects';

import * as Enums from './Enums';
import * as Types from './Types';

// const flipMap: Dictionary<Direction> = {
//   [Enums.Direction.Across]: Enums.Direction.Down,
//   [Enums.Direction.Down]: Enums.Direction.Across,
// };

// export const toggleDirection = (direction: Direction) => {
//   return flipMap[direction];
// };

const hasBorderAbove = (shape: Types.Shape, cell: Types.Cell): boolean => {
  return cell < shape.width || includes(shape.blocks, cell - shape.width);
};

const hasBorderRight = (shape: Types.Shape, cell: Types.Cell): boolean => {
  return cell % shape.width === (shape.width - 1) || includes(shape.blocks, cell + 1);
};

const hasBorderLeft = (shape: Types.Shape, cell: Types.Cell): boolean => {
  return cell % shape.width === 0 || includes(shape.blocks, cell - 1);
};

const hasBorderBelow = (shape: Types.Shape, cell: Types.Cell): boolean => {
  return cell >= shape.width * (shape.height - 1) || includes(shape.blocks, cell + shape.width);
};

const goToEnd = (shape: Types.Shape, cell: Types.Cell, direction: Enums.Direction): number[] => {
  let testCell = cell;
  const arr = [];
  const stepSize = (direction === Enums.Direction.Across) ? 1 : shape.width;
  const maxCell = shape.width * shape.height;
  while (testCell < maxCell) {
    arr.push(testCell);
    if (direction === Enums.Direction.Across) {
      if (hasBorderRight(shape, testCell)) {
        break;
      }
    } else {
      if (hasBorderBelow(shape, testCell)) {
        break;
      }
    }
    testCell += stepSize;
  }
  return arr;
};

const isSlotStart = (shape: Types.Shape, cell: Types.Cell, direction: Enums.Direction): boolean => {
  switch (direction) {
    case Enums.Direction.Across: return hasBorderLeft(shape, cell);
    case Enums.Direction.Down: return hasBorderAbove(shape, cell);
  }
};

export const getSlots = (shape: Types.Shape): Types.Slot[] => {
  const slots: Types.Slot[] = [];
  let clue = 1;
  times(shape.width * shape.height, cell => {
    if (includes(shape.blocks, cell)) {
      return;
    }
    let increment = 0;
    values(Enums.Direction).forEach(direction => {
      if (isSlotStart(shape, cell, direction)) {
        const cells = goToEnd(shape, cell, direction);
        if (cells.length > 1) {
          slots.push({ id: clue + direction, clue, direction, cells, intersections: [] });
          increment = 1;
        }
      }
    });
    clue += increment;
  });

  const openSet = [ ...slots ];
  let slot: Types.Slot | undefined;
  while (slot = openSet.shift()) {
    slot.cells.forEach((cell, i) => {
      openSet.some(otherSlot => {
        const otherSlotIntersectionIndex = otherSlot.cells.indexOf(cell);
        if (otherSlotIntersectionIndex === -1) {
          return false;
        }
        otherSlot.intersections.push({
          cell,
          otherId: slot!.id,
          otherIndex: i,
        });
        slot!.intersections.push({
          cell,
          otherId: otherSlot.id,
          otherIndex: otherSlotIntersectionIndex,
        });
        return true;
      });
    });
  }

  return slots;
};

// TODO: Move this to a selector
export const getCellToClueMap = (slots: Types.Slot[]): Types.CellToClueMap => {
  const cellToClueMap: Types.CellToClueMap = {};
  slots.forEach(slot => {
    cellToClueMap[slot.cells[0]] = slot.clue;
  });
  return cellToClueMap;
};

// TODO: Move this to a selector
export const getWordCounts = (slots: Types.Slot[]): Types.WordCountMap => {
  return groupBy(slots, slot => slot.cells.length);
};
