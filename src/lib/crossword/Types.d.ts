import * as Enums from './Enums';

export interface Shape {
  width: number;
  height: number;
  blocks: number[];
}

type Cell = number; // index in a grid

interface Intersection {
  index: number;
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

export interface FittingWords {
  [slotId: string]: string[] | null; // null means slot is closed
}

export interface ClosedSet {
  [slotId: string]: string;
}

export type FillResult = { success: true; closedSet: ClosedSet; } | { success: false };

export interface Constraints {
  slots: Slot[];
  fittingWords: FittingWords;
  closedSet: ClosedSet;
  slot: Slot;
}
