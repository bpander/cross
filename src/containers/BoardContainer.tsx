import React from 'react';
import { connect } from 'react-redux';

import { ContainerProps } from 'containers/definitions/Containers';
import { times } from 'util/arrays';

const BOARD_WIDTH = 630;

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
  size: number;
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

const BoardContainer: React.SFC<ContainerProps> = props => {
  const cellSize = BOARD_WIDTH / props.board.size;

  return (
    <svg
      width={BOARD_WIDTH}
      height={BOARD_WIDTH}
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_WIDTH}`}
      className="board"
    >
      <Cells size={props.board.size} cellSize={cellSize} />
      <Grid size={props.board.size} cellSize={cellSize} />
    </svg>
  );
};

export default connect(state => state)(BoardContainer);
