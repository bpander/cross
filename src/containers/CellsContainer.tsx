import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import { BLACK_SYMBOL, BOARD_WIDTH } from 'config/global';
import { ContainerProps } from 'containers/definitions/Containers';
import { CellToClueMap, getCellToClueMap, Slot } from 'lib/crossword';
import { boardActions, boardSelectors } from 'redux-modules/board';
import { includes, times } from 'util/arrays';

class CellsContainer extends React.Component<ContainerProps> {

  renderCell(cell: number, cellToClueMap: CellToClueMap, highlightedSlot?: Slot) {
    const { board } = this.props;
    const cellSize = BOARD_WIDTH / board.size;
    const x = (cell % board.size) * cellSize;
    const y = Math.floor(cell / board.size) * cellSize;

    return (
      <g
        key={cell}
        onClick={() => {
          this.props.dispatch(boardActions.setCursor(cell));
          if (cell === this.props.board.cursor) {
            this.props.dispatch(boardActions.toggleDirection());
          }
        }}
      >
        <rect
          x={x}
          y={y}
          width={cellSize}
          height={cellSize}
          className={classNames('board__cell', {
            'board__cell--highlight': highlightedSlot && includes(highlightedSlot.cells, cell),
            'board__cell--cursor': cell === board.cursor,
            'board__cell--black': board.grid[cell] === BLACK_SYMBOL,
          })}
        />
        {(cellToClueMap[cell]) && (
          <text
            x={x + cellSize * 0.05}
            y={y + cellSize * 0.05}
            alignmentBaseline="hanging"
            fontSize={cellSize * 0.3}
          >
            {cellToClueMap[cell]}
          </text>
        )}
        {(board.grid[cell] && board.grid[cell] !== BLACK_SYMBOL) && (
          <text
            x={x + (cellSize / 2)}
            y={y + cellSize - (cellSize * 0.1)}
            textAnchor="middle"
            alignmentBaseline="baseline"
            fontSize={cellSize * 0.8}
          >
            {board.grid[cell]}
          </text>
        )}
      </g>
    );
  }

  render() {
    const { board } = this.props;
    const slots = boardSelectors.getSlots(board);
    const cellToClueMap = getCellToClueMap(slots);
    const slotAtCursor = boardSelectors.getSlotAtCursor(this.props.board);

    return (
      <g data-group="cells">
        {times(board.size ** 2, i => this.renderCell(i, cellToClueMap, slotAtCursor))}
      </g>
    );
  }
}

export default connect(state => state)(CellsContainer);
