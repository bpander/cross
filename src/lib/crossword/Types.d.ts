import * as Enums from './Enums';

export interface Shape {
  width: number;
  height: number;
  blocks: number[];
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
  direction: Enums.Direction;
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
