import classNames from 'classnames';
import React from 'react';

import { BOARD_WIDTH } from 'config/global';
import { ContainerProps } from 'containers/definitions/Containers';
import * as Types from 'lib/crossword/Types';
import { setCursor, toggleDirection } from 'state/board';
import { editorBoardLens } from 'state/root';
import { getCellToClueMap } from 'state/shape';
import { getSlotAtCursor } from 'state/viewer';
import { includes, times } from 'util/arrays';
import { StoreContext } from 'react-store';
import { compose } from 'lib/createStore';

class CellsContainer extends React.Component<ContainerProps> {

  static contextType = StoreContext;
  context!: React.ContextType<typeof StoreContext>;

  renderCell(cell: number, cellToClueMap: { [cell: number]: number; }, highlightedSlot?: Types.Slot) {
    const { board, shape } = this.context.getState().editor;
    const cellSize = BOARD_WIDTH / shape.width;
    const x = (cell % shape.width) * cellSize;
    const y = Math.floor(cell / shape.width) * cellSize;

    return (
      <g
        key={cell}
        onClick={() => {
          const setters = [];
          if (cell === board.cursor) {
            setters.push(toggleDirection()(editorBoardLens));
          }
          this.context.update(
            compose(setCursor(cell)(editorBoardLens), ...setters),
          );
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
    const { shape } = this.context.getState().editor;
    const cellToClueMap = getCellToClueMap(shape);
    const slotAtCursor = getSlotAtCursor(this.context.getState().editor);

    return (
      <g data-group="cells">
        {times(shape.width * shape.height, i => this.renderCell(i, cellToClueMap, slotAtCursor))}
      </g>
    );
  }
}

export default CellsContainer;
