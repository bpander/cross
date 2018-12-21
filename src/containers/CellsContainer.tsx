import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import { BLACK_SYMBOL, BOARD_WIDTH } from 'config/global';
import { ContainerProps } from 'containers/definitions/Containers';
import Dictionary from 'definitions/Dictionary';
import { AnswerMap, CellToClueMap, getAnswerMap, getCellToClueMap } from 'lib/crossword';
import * as boardModule from 'redux-modules/board';
import { includes, times } from 'util/arrays';
import { values } from 'util/objects';

class CellsContainer extends React.Component<ContainerProps> {

  onCellKeyDown: React.KeyboardEventHandler<SVGElement> = e => {
    if (e.key.match(/^[a-z]$/i) || e.key === BLACK_SYMBOL) {
      this.props.dispatch(boardModule.actions.setValueAtCursor(e.key.toUpperCase()));
    } else if (e.key === 'Backspace') {
      this.props.dispatch(boardModule.actions.setValueAtCursor(''));
    }
  };

  getHighlightedCells(answerMap: AnswerMap): number[] | undefined {
    const { board } = this.props;
    if (!board.cursor) {
      return;
    }
    const answerCellsMap = answerMap[board.direction] as Dictionary<number[]>;
    return values(answerCellsMap).find(cells => includes(cells, board.cursor));
  }

  renderCell(cell: number, cellToClueMap: CellToClueMap, highlightedCells?: number[]) {
    const { board } = this.props;
    const cellSize = BOARD_WIDTH / board.size;
    const x = (cell % board.size) * cellSize;
    const y = Math.floor(cell / board.size) * cellSize;

    return (
      <g
        tabIndex={0}
        key={cell}
        onKeyDown={this.onCellKeyDown}
        onClick={() => this.props.dispatch(boardModule.actions.setCursor(cell))}
      >
        <rect
          x={x}
          y={y}
          width={cellSize}
          height={cellSize}
          className={classNames('board__cell', {
            'board__cell--highlight': highlightedCells && includes(highlightedCells, cell),
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
    const answerMap = getAnswerMap(board);
    const cellToClueMap = getCellToClueMap(answerMap);
    const highlightedCells = this.getHighlightedCells(answerMap);

    return (
      <g data-group="cells">
        {times(board.size ** 2, i => this.renderCell(i, cellToClueMap, highlightedCells))}
      </g>
    );
  }
}

export default connect(state => state)(CellsContainer);
