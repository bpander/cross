import classNames from 'classnames';
import React from 'react';

import { BOARD_WIDTH } from 'config/global';
import { ContainerProps, mapStoreToContainerProps } from 'containers/container';
import * as Types from 'lib/crossword/Types';
import { injectStore } from 'lib/react-store';
import { setCursor, toggleDirection } from 'state/board';
import { editorBoardLens } from 'state/root';
import { getCellToClueMap } from 'state/shape';
import { getSlotAtCursor } from 'state/viewer';
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
          const setter = (cell === board.cursor)
            ? toggleDirection(editorBoardLens)()
            : setCursor(editorBoardLens)(cell);
          this.props.update(setter);
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
    const cellToClueMap = getCellToClueMap(shape);
    const slotAtCursor = getSlotAtCursor(this.props.editor);

    return (
      <g data-group="cells">
        {times(shape.width * shape.height, i => this.renderCell(i, cellToClueMap, slotAtCursor))}
      </g>
    );
  }
}

export default injectStore(mapStoreToContainerProps)(CellsContainer);
