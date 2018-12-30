import chunk from 'lodash/chunk';
import clamp from 'lodash/clamp';
import values from 'lodash/values';
import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router';

import Grid from 'components/Grid';
import Tabs, { Tab } from 'components/Tabs';
import { BLACK_SYMBOL, BOARD_WIDTH } from 'config/global';
import CellsContainer from 'containers/CellsContainer';
import { ContainerProps } from 'containers/definitions/Containers';
import EditorStructureContainer from 'containers/EditorStructureContainer';
import dictTxt from 'data/dict.txt';
import { autoFill, getAnswerMap_v2 } from 'lib/crossword';
import * as boardModule from 'redux-modules/board';
import { getIndex, getXY } from 'util/grid2Ds';

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
    window.addEventListener('keydown', this.onKeyDown);
    const response = await fetch(dictTxt);
    const dictStr = await response.text();
    const words = dictStr.split('\n');
    const wordsJumbled = [ ...words ].sort(() => 1 - Math.round(Math.random() * 2));

    const answerMap = getAnswerMap_v2(this.props.board);
    const uncheckedAnswers = values(answerMap).filter(
      answer => answer.cells.some(cell => this.props.board.grid[cell] === ''),
    );

    console.log('starting fill...');
    const fillResult = autoFill(this.props.board.grid, uncheckedAnswers, { 5: wordsJumbled });
    console.log({ fillResult });
    if (fillResult.success) {
      console.log(chunk(fillResult.grid, this.props.board.size));
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (e: KeyboardEvent) => {
    const { board } = this.props;
    let directionMultiplier = 1;
    switch (e.key) {
      case 'ArrowUp':
        directionMultiplier = -1;
      case 'ArrowDown': {
        const [ x ] = getXY(board.size, board.cursor);
        const min = getIndex(board.size, [ x, 0 ]);
        const max = getIndex(board.size, [ x, board.size - 1 ]);
        const cursor = clamp(board.cursor + board.size * directionMultiplier, min, max);
        this.props.dispatch(boardModule.actions.setCursor(cursor));
        break;
      }

      case 'ArrowLeft':
        directionMultiplier = -1;
      case 'ArrowRight': {
        const [ , y ] = getXY(board.size, board.cursor);
        const min = getIndex(board.size, [ 0, y ]);
        const max = getIndex(board.size, [ board.size - 1, y ]);
        const cursor = clamp(board.cursor + directionMultiplier, min, max);
        this.props.dispatch(boardModule.actions.setCursor(cursor));
        break;
      }

      case 'Enter': return this.props.dispatch(boardModule.actions.toggleDirection());
      case 'Backspace': return this.props.dispatch(boardModule.actions.setValueAtCursor(''));
      default:
        if (e.key.match(/^[a-z]$/i) || e.key === BLACK_SYMBOL) {
          this.props.dispatch(boardModule.actions.setValueAtCursor(e.key.toUpperCase()));
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
