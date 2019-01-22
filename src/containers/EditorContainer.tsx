import clamp from 'lodash/clamp';
import React from 'react';
import { Route } from 'react-router';

import Grid from 'components/Grid';
import Tabs, { Tab } from 'components/Tabs';
import { BLACK_SYMBOL, BOARD_WIDTH } from 'config/global';
import CellsContainer from 'containers/CellsContainer';
import { ContainerProps } from 'containers/definitions/Containers';
import EditorFillContainer from 'containers/EditorFillContainer';
import EditorStructureContainer from 'containers/EditorStructureContainer';
import { StoreContext } from 'react-store';
import { setCursor, toggleDirection } from 'state/board';
import { fetchWordList } from 'state/dictionary';
import { dictionaryLens, editorBoardLens, editorLens } from 'state/root';
import { setValueAtCursor } from 'state/viewer';
import { getIndex, getXY } from 'util/grid2Ds';

type EditorProps = ContainerProps<{ puzzleId?: string; }>;

interface EditorContainerState {
  tab: number;
}

class EditorContainer extends React.Component<EditorProps, EditorContainerState> {

  static contextType = StoreContext;
  context!: React.ContextType<typeof StoreContext>;

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
    window.addEventListener('keydown', this.onKeyDown);
    this.context.update(fetchWordList(dictionaryLens)());
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  // TODO: Organize this better
  // tslint:disable-next-line cyclomatic-complexity
  onKeyDown = (e: KeyboardEvent) => {
    const { board, shape } = this.context.getState().editor;
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
        this.context.update(setCursor(editorBoardLens)(cursor));
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
        this.context.update(setCursor(editorBoardLens)(cursor));
        break;
      }

      case 'Enter': return this.context.update(toggleDirection(editorBoardLens)());
      case 'Backspace': return this.context.update(setValueAtCursor(editorLens)(''));
      default:
        if (e.key.match(/^[a-z]$/i) || e.key === BLACK_SYMBOL) {
          this.context.update(setValueAtCursor(editorLens)(e.key.toUpperCase()));
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
            <Grid size={this.context.getState().editor.shape.width} />
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

export default EditorContainer;
