import clamp from 'lodash/clamp';
import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';
import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router';

import Grid from 'components/Grid';
import Tabs, { Tab } from 'components/Tabs';
import { BLACK_SYMBOL, BOARD_WIDTH } from 'config/global';
import CellsContainer from 'containers/CellsContainer';
import { ContainerProps } from 'containers/definitions/Containers';
import EditorStructureContainer from 'containers/EditorStructureContainer';
import dictPath from 'data/default.dict';
import { autoFill, getSlots } from 'lib/crossword';
import { parser } from 'parsers/dict.parser';
import { boardActions } from 'redux-modules/board';
import { getIndex, getXY } from 'util/grid2Ds';
import { mapValues } from 'util/objects';

type EditorProps = ContainerProps<{ puzzleId?: string; }>;

interface EditorContainerState {
  tab: number;
}

class EditorContainer extends React.Component<EditorProps, EditorContainerState> {

  static tabs: Tab[] = [
    {
      label: 'Structure',
      panel: () => <Route component={EditorStructureContainer} />,
    },
    {
      label: 'Fill',
      panel: () => <div>fill</div>,
    },
    {
      label: 'Clues',
      panel: () => <div>clues</div>,
    },
    {
      label: 'Share/Export',
      panel: () => <div>share/export</div>,
    },
  ];

  constructor(props: EditorProps) {
    super(props);
    this.state = {
      tab: 0,
    };
  }

  async componentDidMount() {
    const dictResponse = await fetch(dictPath);
    const dictContents = await dictResponse.text();
    const dictResult = parser(dictContents);
    const wordsGrouped = groupBy(dictResult.data, 'length');
    const { board } = this.props;
    const slots = getSlots(board);
    const fittingWords = mapValues(keyBy(slots, 'id'), slot => wordsGrouped[slot.cells.length]);
    const shouldFill = false;
    if (shouldFill) {
      const autoFillResult = autoFill(board.grid, slots, fittingWords, []);
      console.log(autoFillResult);
    }

    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  // TODO: Organize this better
  // tslint:disable-next-line cyclomatic-complexity
  onKeyDown = (e: KeyboardEvent) => {
    const { board } = this.props;
    let directionMultiplier = 1;
    switch (e.key) {
      case 'ArrowUp':
        directionMultiplier = -1;

      // tslint:disable-next-line no-switch-case-fall-through
      case 'ArrowDown': {
        const [ x ] = getXY(board.size, board.cursor);
        const min = getIndex(board.size, [ x, 0 ]);
        const max = getIndex(board.size, [ x, board.size - 1 ]);
        const cursor = clamp(board.cursor + board.size * directionMultiplier, min, max);
        this.props.dispatch(boardActions.setCursor(cursor));
        break;
      }

      case 'ArrowLeft':
        directionMultiplier = -1;

      // tslint:disable-next-line no-switch-case-fall-through
      case 'ArrowRight': {
        const [ , y ] = getXY(board.size, board.cursor);
        const min = getIndex(board.size, [ 0, y ]);
        const max = getIndex(board.size, [ board.size - 1, y ]);
        const cursor = clamp(board.cursor + directionMultiplier, min, max);
        this.props.dispatch(boardActions.setCursor(cursor));
        break;
      }

      case 'Enter': return this.props.dispatch(boardActions.toggleDirection());
      case 'Backspace': return this.props.dispatch(boardActions.setValueAtCursor(''));
      default:
        if (e.key.match(/^[a-z]$/i) || e.key === BLACK_SYMBOL) {
          this.props.dispatch(boardActions.setValueAtCursor(e.key.toUpperCase()));
        }
    }
  };

  onTabChange = (tab: number) => {
    this.setState({ tab });
  };

  render() {
    return (
      <div className="grid">
        <div className="grid__col">
          <svg
            width={BOARD_WIDTH}
            height={BOARD_WIDTH}
            viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_WIDTH}`}
            className="board"
          >
            <Route component={CellsContainer} />
            <Grid size={this.props.board.size} />
          </svg>
        </div>
        <div className="grid__col">
          <Tabs
            tabs={EditorContainer.tabs}
            active={this.state.tab}
            onChange={this.onTabChange}
          />
        </div>
      </div>
    );
  }
}

export default connect(state => state)(EditorContainer);
