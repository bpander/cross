import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import { BLACK_SYMBOL } from 'config/global';
import { ContainerProps } from 'containers/definitions/Containers';
import * as board from 'redux-modules/board';
import { times } from 'util/arrays';

const BOARD_WIDTH = 630;

interface CellsProps {
  size: number;
  cellSize: number;
  grid: string[];
  onCellChange: (pos: number) => void;
  onCellFill: (value: string) => void;
  cursor: number | null;
}

const Cells: React.SFC<CellsProps> = props => (
  <g data-group="cells">
    {times(props.size ** 2, i => (
      <g
        tabIndex={0}
        key={i}
        onKeyDown={e => {
          if (e.key.match(/^[a-z]$/i) || e.key === BLACK_SYMBOL) {
            props.onCellFill(e.key.toUpperCase());
          } else if (e.key === 'Backspace') {
            props.onCellFill('');
          }
        }}
        onClick={() => props.onCellChange(i)}
      >
        <rect
          x={(i % props.size) * props.cellSize}
          y={Math.floor(i / props.size) * props.cellSize}
          width={props.cellSize}
          height={props.cellSize}
          className={classNames('board__cell', {
            'board__cell--cursor': i === props.cursor,
            'board__cell--black': props.grid[i] === BLACK_SYMBOL,
          })}
        />
        {(props.grid[i] && props.grid[i] !== BLACK_SYMBOL) && (
          <text
            x={(i % props.size) * props.cellSize + (props.cellSize / 2)}
            y={Math.floor(i / props.size) * props.cellSize + props.cellSize - (props.cellSize * 0.1)}
            textAnchor="middle"
            alignmentBaseline="baseline"
            fontSize={props.cellSize * 0.8}
          >
            {props.grid[i]}
          </text>
        )}
      </g>
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
      <Cells
        size={props.board.size}
        grid={props.board.grid}
        cellSize={cellSize}
        onCellChange={i => props.dispatch(board.actions.setCursor(i))}
        onCellFill={value => props.dispatch(board.actions.setValueAtCursor(value))}
        cursor={props.board.cursor}
      />
      <Grid size={props.board.size} cellSize={cellSize} />
    </svg>
  );
};

export default connect(state => state)(BoardContainer);
