import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router';

import { BOARD_WIDTH } from 'config/global';
import CellsContainer from 'containers/CellsContainer';
import { ContainerProps } from 'containers/definitions/Containers';
import { times } from 'util/arrays';

interface GridProps {
  size: number;
}

class Grid extends React.PureComponent<GridProps> {

  static getPathDef(props: GridProps): string {
    const { size } = props;
    const cellSize = BOARD_WIDTH / size;
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

// TODO: Does this need to be a container?
const BoardContainer: React.SFC<ContainerProps> = props => (
  <svg
    width={BOARD_WIDTH}
    height={BOARD_WIDTH}
    viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_WIDTH}`}
    className="board"
  >
    <Route component={CellsContainer} />
    <Grid size={props.board.size} />
  </svg>
);

export default connect(state => state)(BoardContainer);
