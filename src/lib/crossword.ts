import { BLACK_SYMBOL } from 'config/global';
import Dictionary from 'definitions/Dictionary';
import { invert, mapValues } from 'util/objects';

export enum Direction {
  Across = 'A',
  Down = 'D',
}

interface Board {
  size: number;
  grid: string[];
}

interface AnswerCellsMap {
  [clue: number]: number[];
}

export interface CellToClueMap {
  [cell: number]: number;
}

export interface AnswerMap {
  [Direction.Across]: AnswerCellsMap;
  [Direction.Down]: AnswerCellsMap;
}

const flipMap: Dictionary<Direction> = {
  [Direction.Across]: Direction.Down,
  [Direction.Down]: Direction.Across,
};

export const toggleDirection = (direction: Direction) => {
  return flipMap[direction];
};

const hasBorderAbove = (board: Board, cell: number): boolean => {
  return cell < board.size || board.grid[cell - board.size] === BLACK_SYMBOL;
};

const hasBorderRight = (board: Board, cell: number): boolean => {
  return cell % board.size === (board.size - 1) || board.grid[cell + 1] === BLACK_SYMBOL;
};

const hasBorderLeft = (board: Board, cell: number): boolean => {
  return cell % board.size === 0 || board.grid[cell - 1] === BLACK_SYMBOL;
};

const hasBorderBelow = (board: Board, cell: number): boolean => {
  return cell >= (board.grid.length - board.size) || board.grid[cell + board.size] === BLACK_SYMBOL;
};

const goToEnd = (board: Board, cell: number, direction: Direction): number[] => {
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

export const getAnswerMap = (board: Board): AnswerMap => {
  const acrossMap: AnswerCellsMap = {};
  const downMap: AnswerCellsMap = {};
  let n = 1;

  board.grid.forEach((value, cell) => {
    if (value === BLACK_SYMBOL) {
      return;
    }
    let increment = 0;
    if (hasBorderLeft(board, cell)) {
      acrossMap[n] = goToEnd(board, cell, Direction.Across);
      increment = 1;
    }
    if (hasBorderAbove(board, cell)) {
      downMap[n] = goToEnd(board, cell, Direction.Down);
      increment = 1;
    }
    n += increment;
  });

  return {
    [Direction.Across]: acrossMap,
    [Direction.Down]: downMap,
  };
};

export const getCellToClueMap = (answerMap: AnswerMap): CellToClueMap => {
  const dedupedAnswerCellsMap = { ...answerMap[Direction.Across], ...answerMap[Direction.Down] };
  const clueToCellMap = mapValues<number[], number>(
    dedupedAnswerCellsMap,
    cells => cells[0],
  );
  const cellToClueMap = mapValues(invert(clueToCellMap), Number);

  return cellToClueMap;
};
