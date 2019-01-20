import clamp from 'lodash/clamp';
import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router';

import Grid from 'components/Grid';
import Tabs, { Tab } from 'components/Tabs';
import { BLACK_SYMBOL, BOARD_WIDTH } from 'config/global';
import CellsContainer from 'containers/CellsContainer';
import { ContainerProps } from 'containers/definitions/Containers';
import EditorFillContainer from 'containers/EditorFillContainer';
import EditorStructureContainer from 'containers/EditorStructureContainer';
import { setCursor, toggleDirection } from 'state/board';
import { fetchWordList } from 'state/dictionary';
import { l, StateContext } from 'state/root';
import { setValueAtCursor } from 'state/viewer';
import { getIndex, getXY } from 'util/grid2Ds';

type EditorProps = ContainerProps<{ puzzleId?: string; }>;

interface EditorContainerState {
  tab: number;
}

class EditorContainer extends React.Component<EditorProps, EditorContainerState> {

  static contextType = StateContext;
  context!: React.ContextType<typeof StateContext>;

  tabs: Tab[] = [
    {
      label: 'Structure',
      panel: () => <Route component={EditorStructureContainer} />,
    },
    {
      label: 'Fill',
      panel: () => <Route component={EditorFillContainer} />,
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
    fetchWordList()(this.context, l.dictionary);
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  // TODO: Organize this better
  // tslint:disable-next-line cyclomatic-complexity
  onKeyDown = (e: KeyboardEvent) => {
    const { board, shape } = this.context.state.editor;
    let directionMultiplier = 1;
    switch (e.key) {
      case 'ArrowUp':
        directionMultiplier = -1;

      // tslint:disable-next-line no-switch-case-fall-through
      case 'ArrowDown': {
        const [ x ] = getXY(shape.width, board.cursor);
        const min = getIndex(shape.width, [ x, 0 ]);
        const max = getIndex(shape.width, [ x, shape.width - 1 ]);
        const cursor = clamp(board.cursor + shape.width * directionMultiplier, min, max);
        setCursor(cursor)(this.context, l.editor.board);
        break;
      }

      case 'ArrowLeft':
        directionMultiplier = -1;

      // tslint:disable-next-line no-switch-case-fall-through
      case 'ArrowRight': {
        const [ , y ] = getXY(shape.width, board.cursor);
        const min = getIndex(shape.width, [ 0, y ]);
        const max = getIndex(shape.width, [ shape.width - 1, y ]);
        const cursor = clamp(board.cursor + directionMultiplier, min, max);
        setCursor(cursor)(this.context, l.editor.board);
        break;
      }

      case 'Enter': return toggleDirection()(this.context, l.editor.board);
      case 'Backspace': return setValueAtCursor('')(this.context, l.editor);
      default:
        if (e.key.match(/^[a-z]$/i) || e.key === BLACK_SYMBOL) {
          setValueAtCursor(e.key.toUpperCase())(this.context, l.editor);
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
            <Grid size={this.context.state.editor.shape.width} />
          </svg>
        </div>
        <div className="grid__col">
          <Tabs
            tabs={this.tabs}
            active={this.state.tab}
            onChange={this.onTabChange}
          />
        </div>
      </div>
    );
  }
}

export default connect(state => state)(EditorContainer);
