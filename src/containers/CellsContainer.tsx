import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import { BOARD_WIDTH } from 'config/global';
import { ContainerProps } from 'containers/definitions/Containers';
import * as Types from 'lib/crossword/Types';
import { boardActions } from 'redux-modules/board';
import { editorSelectors } from 'redux-modules/editor';
import { shapeSelectors } from 'redux-modules/shape';
import { includes, times } from 'util/arrays';

class CellsContainer extends React.Component<ContainerProps> {

  renderCell(cell: number, cellToClueMap: { [cell: number]: number; }, highlightedSlot?: Types.Slot) {
    const { board, shape } = this.props.editor;
    const cellSize = BOARD_WIDTH / shape.width;
    const x = (cell % shape.width) * cellSize;
    const y = Math.floor(cell / shape.width) * cellSize;

    return (
      <g
        key={cell}
        onClick={() => {
          this.props.dispatch(boardActions.setCursor(cell));
          if (cell === board.cursor) {
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
            'board__cell--black': includes(shape.blocks, cell),
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
        {(board.letters[cell]) && (
          <text
            x={x + (cellSize / 2)}
            y={y + cellSize - (cellSize * 0.1)}
            textAnchor="middle"
            alignmentBaseline="baseline"
            fontSize={cellSize * 0.8}
          >
            {board.letters[cell]}
          </text>
        )}
      </g>
    );
  }

  render() {
    const { shape } = this.props.editor;
    const cellToClueMap = shapeSelectors.getCellToClueMap(shape);
    const slotAtCursor = editorSelectors.getSlotAtCursor(this.props.editor);

    return (
      <g data-group="cells">
        {times(shape.width * shape.height, i => this.renderCell(i, cellToClueMap, slotAtCursor))}
      </g>
    );
  }
}

export default connect(state => state)(CellsContainer);
