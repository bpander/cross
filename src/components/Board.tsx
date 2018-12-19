import React from 'react';

import { times } from 'util/arrays';

type BoardSizeOption = 15 | 21;

interface BoardProps {
  size: BoardSizeOption;
}

const BOARD_SIZE = 630;

interface CellsProps {
  size: number;
  cellSize: number;
}

const Cells: React.SFC<CellsProps> = props => (
  <g data-group="cells">
    {times(props.size ** 2, i => (
      <rect
        key={i}
        x={(i % props.size) * props.cellSize}
        y={Math.floor(i / props.size) * props.cellSize}
        width={props.cellSize}
        height={props.cellSize}
        className="board__cell"
      />
    ))}
  </g>
);

interface GridProps {
  size: BoardSizeOption;
  cellSize: number;
}

class Grid extends React.PureComponent<GridProps> {

  static getPathDef(props: GridProps): string {
    const { size, cellSize } = props;
    const latitudes = times(
      size - 1,
      i => `M0,${cellSize + cellSize * i} L${cellSize * size},${cellSize + cellSize * i}`,
    );
    const longitudes = times(
      size - 1,
      i => `M${cellSize + cellSize * i},0 L${cellSize + cellSize * i},${cellSize * size}`,
    );
    return [ ...latitudes, ...longitudes ].join(' ');
  }

  render() {
    return (
      <g data-group="grid">
        <path
          d={Grid.getPathDef(this.props)}
          stroke="dimgrey"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  }
}

const Board: React.SFC<BoardProps> = props => {
  const cellSize = BOARD_SIZE / props.size;

  return (
    <svg
      width={BOARD_SIZE}
      height={BOARD_SIZE}
      viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
      className="board"
    >
      <Cells size={props.size} cellSize={cellSize} />
      <Grid size={props.size} cellSize={cellSize} />
    </svg>
  );
};

export default Board;
