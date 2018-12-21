import Dictionary from 'definitions/Dictionary';

export enum Direction {
  Across = 'A',
  Down = 'D',
}

const flipMap: Dictionary<Direction> = {
  [Direction.Across]: Direction.Down,
  [Direction.Down]: Direction.Across,
};

export const toggleDirection = (direction: Direction, shouldToggle: boolean = true) => {
  return (shouldToggle) ? flipMap[direction] : direction;
};
