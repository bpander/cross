import React from 'react';

import { times } from 'util/arrays';

type GridSizeOption = 15 | 21;

interface GridProps {
  size: GridSizeOption;
}

// TODO: Get rid of hardcoded "500"

const getGridPath = (size: GridSizeOption, cellSize: number): string => {
  const latitudes = times(
    size - 1,
    i => `M0,${cellSize + cellSize * i} L500,${cellSize + cellSize * i}`,
  );
  const longitudes = times(
    size - 1,
    i => `M${cellSize + cellSize * i},0 L${cellSize + cellSize * i},500`,
  );
  return [ ...latitudes, ...longitudes ].join(' ');
};

const Grid: React.SFC<GridProps> = props => (
  <div className="grid">
    <svg width={500} height={500} viewBox="0 0 500 500">
      <g>
        <path
          d={getGridPath(props.size, 500 / props.size)}
          stroke="dimgrey"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  </div>
);

export default Grid;
