import assignWith from 'lodash/assignWith';
import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';

import { BLACK_SYMBOL } from 'config/global';
import Dictionary from 'definitions/Dictionary';
import { invert, mapValues, values } from 'util/objects';
import { Trie, some, add, only } from 'lib/tries';

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

interface WordCountMap { [wordLength: number]: number[][]; }

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

export const getWordCounts = (answerMap: AnswerMap): WordCountMap => {
  const wordCounts: WordCountMap = assignWith(
    groupBy(answerMap[Direction.Across], 'length'),
    groupBy(answerMap[Direction.Down], 'length'),
    (objectValue = [], sourceValue) => [ ...objectValue, ...sourceValue ],
  );

  return wordCounts;
};

interface Intersection {
  id: string;
  index: number;
  otherId: string;
  otherIndex: number;
}

type Cell = number;
interface Answer {
  id: string;
  clue: number;
  direction: Direction;
  cells: Cell[];
  intersections: Intersection[];
}

const isClueStart = (board: Board, cell: number, direction: Direction): boolean => {
  switch (direction) {
    case Direction.Across: return hasBorderLeft(board, cell);
    case Direction.Down: return hasBorderAbove(board, cell);
  }
};

export const getAnswerMap_v2 = (board: Board): Dictionary<Answer> => {
  const answers: Answer[] = [];
  let clue = 1;
  board.grid.forEach((value, cell) => {
    if (value === BLACK_SYMBOL) {
      return;
    }
    let increment = 0;
    values(Direction).forEach(direction => {
      if (isClueStart(board, cell, direction)) {
        const cells = goToEnd(board, cell, direction);
        if (cells.length > 1) {
          answers.push({ id: clue + direction, clue, direction, cells, intersections: [] });
          increment = 1;
        }
      }
    });
    clue += increment;
  });

  const openSet = [ ...answers ];
  let answer: Answer | undefined;
  while (answer = openSet.shift()) {
    answer.cells.forEach((cell, i) => {
      openSet.some(otherAnswer => {
        const otherAnswerIntersectionIndex = otherAnswer.cells.indexOf(cell);
        if (otherAnswerIntersectionIndex === -1) {
          return false;
        }
        otherAnswer.intersections.push({
          id: otherAnswer.id,
          index: otherAnswerIntersectionIndex,
          otherId: answer!.id,
          otherIndex: i,
        });
        answer!.intersections.push({
          id: answer!.id,
          index: i,
          otherId: otherAnswer.id,
          otherIndex: otherAnswerIntersectionIndex,
        });
        return true;
      });
    });
  }

  return keyBy(answers, 'id');
};

type AutoFillResult = { success: false; } | { success: true; grid: string[]; };

const fillWordAt = (grid: string[], word: string, answer: Answer): string[] => {
  const gridCopy = [ ...grid ];
  answer.cells.forEach((cell, i) => {
    gridCopy[cell] = word.slice(i, i + 1);
  });
  return gridCopy;
};

// const strMatch = (grid: string[], answer: Answer, candidate: string): boolean => {
//   for (let i = 0; i < answer.cells.length; i++) {
//     if (grid[answer.cells[i]] && grid[answer.cells[i]] !== candidate[i]) {
//       return false;
//     }
//   }
//   return true;
// };

// const isEmpty = (chars: string[]): boolean => {
//   return chars.every(char => char === '');
// };

const objIncludes = <T>(o: Dictionary<T>, needle: T): boolean => {
  for (const key in o) {
    if (o[key] === needle) {
      return true;
    }
  }
  return false;
};

export const autoFill = (grid: string[], answers: Answer[], fittingWords: { [id: string]: Trie; }, closed: { [id: string]: string; }): AutoFillResult => {
  let res: AutoFillResult = { success: false };
  let answer: Answer | undefined;
  let previousMin = Infinity;
  answers.forEach(a => {
    if (closed[a.id]) {
      return;
    }
    const count = fittingWords[a.id].size;
    if (count < previousMin) {
      answer = a;
      previousMin = count;
    }
  });
  if (!answer) {
    return { success: true, grid };
  }
  some(fittingWords[answer.id], answer.cells.length - 1, candidate => {
    if (objIncludes(closed, candidate)) {
      return false;
    }
    const g = fillWordAt(grid, candidate, answer!);
    const closedClone = { ...closed, [answer!.id]: candidate };
    const fittingWordsClone: Dictionary<Trie> = {
      ...fittingWords,
      [answer!.id]: add({ size: 0, children: {} }, candidate),
    };
    const hasZero = answer!.intersections.some(intersection => {
      if (closedClone[intersection.otherId]) {
        return false;
      }
      const char = g[answer!.cells[intersection.index]];
      fittingWordsClone[intersection.otherId] = only(
        fittingWordsClone[intersection.otherId],
        intersection.otherIndex,
        char,
      );
      return fittingWordsClone[intersection.otherId].size === 0;
    });
    if (!hasZero) {
      res = autoFill(g, answers, fittingWordsClone, closedClone);
    }
    return res.success;
  });

  return res;
};
