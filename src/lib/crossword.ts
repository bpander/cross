import groupBy from 'lodash/groupBy';

import { BLACK_SYMBOL } from 'config/global';
import Dictionary from 'definitions/Dictionary';
import { values } from 'util/objects';

export enum Direction {
  Across = 'A',
  Down = 'D',
}

interface Board {
  size: number;
  grid: string[];
}

type Cell = number; // index in a grid

interface Intersection {
  cell: Cell;
  otherId: string;
  otherIndex: number;
}

export interface Slot {
  id: string;
  clue: number;
  direction: Direction;
  cells: Cell[];
  intersections: Intersection[];
}

export interface CellToClueMap {
  [cell: number]: number;
}

interface WordCountMap { [wordLength: number]: Slot[]; }

interface FittingWords {
  [slotId: string]: string[] | null; // null means slot is closed
}

type AutoFillResult = { success: true; grid: string[]; } | { success: false };

const flipMap: Dictionary<Direction> = {
  [Direction.Across]: Direction.Down,
  [Direction.Down]: Direction.Across,
};

export const toggleDirection = (direction: Direction) => {
  return flipMap[direction];
};

const hasBorderAbove = (board: Board, cell: Cell): boolean => {
  return cell < board.size || board.grid[cell - board.size] === BLACK_SYMBOL;
};

const hasBorderRight = (board: Board, cell: Cell): boolean => {
  return cell % board.size === (board.size - 1) || board.grid[cell + 1] === BLACK_SYMBOL;
};

const hasBorderLeft = (board: Board, cell: Cell): boolean => {
  return cell % board.size === 0 || board.grid[cell - 1] === BLACK_SYMBOL;
};

const hasBorderBelow = (board: Board, cell: Cell): boolean => {
  return cell >= (board.grid.length - board.size) || board.grid[cell + board.size] === BLACK_SYMBOL;
};

const goToEnd = (board: Board, cell: Cell, direction: Direction): number[] => {
  let testCell = cell;
  const arr = [];
  const stepSize = (direction === Direction.Across) ? 1 : board.size;
  while (testCell < board.grid.length) {
    arr.push(testCell);
    if (direction === Direction.Across) {
      if (hasBorderRight(board, testCell)) {
        break;
      }
    } else {
      if (hasBorderBelow(board, testCell)) {
        break;
      }
    }
    testCell += stepSize;
  }
  return arr;
};

const isSlotStart = (board: Board, cell: Cell, direction: Direction): boolean => {
  switch (direction) {
    case Direction.Across: return hasBorderLeft(board, cell);
    case Direction.Down: return hasBorderAbove(board, cell);
  }
};

export const getSlots = (board: Board): Slot[] => {
  const slots: Slot[] = [];
  let clue = 1;
  board.grid.forEach((value, cell) => {
    if (value === BLACK_SYMBOL) {
      return;
    }
    let increment = 0;
    values(Direction).forEach(direction => {
      if (isSlotStart(board, cell, direction)) {
        const cells = goToEnd(board, cell, direction);
        if (cells.length > 1) {
          slots.push({ id: clue + direction, clue, direction, cells, intersections: [] });
          increment = 1;
        }
      }
    });
    clue += increment;
  });

  const openSet = [ ...slots ];
  let slot: Slot | undefined;
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

export const getCellToClueMap = (slots: Slot[]): CellToClueMap => {
  const cellToClueMap: CellToClueMap = {};
  slots.forEach(slot => {
    cellToClueMap[slot.cells[0]] = slot.clue;
  });
  return cellToClueMap;
};

export const getWordCounts = (slots: Slot[]): WordCountMap => {
  return groupBy(slots, slot => slot.cells.length);
};

const fillWordAt = (grid: string[], word: string, slot: Slot): string[] => {
  const gridCopy = [ ...grid ];
  slot.cells.forEach((cell, i) => {
    gridCopy[cell] = word.slice(i, i + 1);
  });
  return gridCopy;
};

const only = (words: string[], index: number, char: string): string[] => {
  return words.filter(word => word.slice(index, index + 1) === char);
};

const getSlotWithLeastFittingWords = (slots: Slot[], fittingWords: FittingWords): Slot | undefined => {
  let slotWithLeastFittingWords: Slot | undefined;
  let previousMin = Infinity;
  slots.forEach(slot => {
    const words = fittingWords[slot.id];
    if (!words) {
      return;
    }
    const count = words.length;
    if (count < previousMin) {
      slotWithLeastFittingWords = slot;
      previousMin = count;
    }
  });
  return slotWithLeastFittingWords;
};

interface AutoFill {
  (grid: string[], slots: Slot[], fittingWords: FittingWords, usedWords: string[]): AutoFillResult;
}

export const autoFill: AutoFill = (grid, slots, fittingWords, usedWords) => {
  let res: AutoFillResult = { success: false };
  const slot = getSlotWithLeastFittingWords(slots, fittingWords);
  if (!slot) {
    return { success: true, grid };
  }
  fittingWords[slot.id]!.some(candidate => {
    if (usedWords.indexOf(candidate) > -1) {
      return false;
    }
    const newGrid = fillWordAt(grid, candidate, slot);
    const newFittingWords: Dictionary<string[] | null> = {
      ...fittingWords,
      [slot.id]: null,
    };
    const hasZero = slot.intersections.some(intersection => {
      const words = newFittingWords[intersection.otherId];
      if (!words) {
        return false;
      }
      const char = newGrid[intersection.cell];
      const newWords = only(words, intersection.otherIndex, char);
      newFittingWords[intersection.otherId] = newWords;
      return newWords.length === 0;
    });
    if (!hasZero) {
      res = autoFill(newGrid, slots, newFittingWords, [ ...usedWords, candidate ]);
    }
    return res.success;
  });

  return res;
};
