import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import { BLACK_SYMBOL, BOARD_WIDTH } from 'config/global';
import { ContainerProps } from 'containers/definitions/Containers';
import * as boardModule from 'redux-modules/board';
import { times } from 'util/arrays';

class CellsContainer extends React.Component<ContainerProps> {

  onCellKeyDown: React.KeyboardEventHandler<SVGElement> = e => {
    if (e.key.match(/^[a-z]$/i) || e.key === BLACK_SYMBOL) {
      this.props.dispatch(boardModule.actions.setValueAtCursor(e.key.toUpperCase()));
    } else if (e.key === 'Backspace') {
      this.props.dispatch(boardModule.actions.setValueAtCursor(''));
    }
  };

  render() {
    const { board } = this.props;
    const cellSize = BOARD_WIDTH / board.size;

    return (
      <g data-group="cells">
        {times(board.size ** 2, i => (
          <g
            tabIndex={0}
            key={i}
            onKeyDown={this.onCellKeyDown}
            onClick={() => this.props.dispatch(boardModule.actions.setCursor(i))}
          >
            <rect
              x={(i % board.size) * cellSize}
              y={Math.floor(i / board.size) * cellSize}
              width={cellSize}
              height={cellSize}
              className={classNames('board__cell', {
                'board__cell--cursor': i === board.cursor,
                'board__cell--black': board.grid[i] === BLACK_SYMBOL,
              })}
            />
            {(board.grid[i] && board.grid[i] !== BLACK_SYMBOL) && (
              <text
                x={(i % board.size) * cellSize + (cellSize / 2)}
                y={Math.floor(i / board.size) * cellSize + cellSize - (cellSize * 0.1)}
                textAnchor="middle"
                alignmentBaseline="baseline"
                fontSize={cellSize * 0.8}
              >
                {board.grid[i]}
              </text>
            )}
          </g>
        ))}
      </g>
    );
  }
}

export default connect(state => state)(CellsContainer);
