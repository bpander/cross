import maxBy from 'lodash/maxBy';
import range from 'lodash/range';
import values from 'lodash/values';
import React from 'react';

import classNames from 'classnames';
import { BLACK_SYMBOL } from 'config/global';
import { ContainerProps } from 'containers/definitions/Containers';
import Icon from 'icons/Icon';
import iconChecker from 'icons/iconChecker';
import iconCircle from 'icons/iconCircle';
import iconCursor from 'icons/iconCursor';
import iconRedo from 'icons/iconRedo';
import iconSquare from 'icons/iconSquare';
import iconTextRotateVertical from 'icons/iconTextRotateVertical';
import iconTextRotationNone from 'icons/iconTextRotationNone';
import iconUndo from 'icons/iconUndo';
import * as Enums from 'lib/crossword/Enums';
import { StoreContext } from 'react-store';
import { toggleDirection } from 'state/board';
import { editorBoardLens, editorLens } from 'state/root';
import { getWordCounts } from 'state/shape';
import { setValueAtCursor } from 'state/viewer';
import { includes } from 'util/arrays';

class EditorStructureContainer extends React.Component<ContainerProps> {

  static contextType = StoreContext;
  context!: React.ContextType<typeof StoreContext>;

  onToggleBlackClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    this.context.update(setValueAtCursor(editorLens)(BLACK_SYMBOL));
  };

  onToggleDirectionClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    this.context.update(toggleDirection(editorBoardLens)());
  };

  renderToolbar() {
    const { board, shape } = this.context.getState().editor;
    const directionIconDef = (board.direction === Enums.Direction.Across)
      ? iconTextRotationNone
      : iconTextRotateVertical;

    return (
      <div className="py-1 typ-1.5">
        <ul className="h-list h-list-1">
          <li>
            <button className="btn d-block">
              <Icon def={iconUndo} className="d-block" />
            </button>
          </li>
          <li>
            <button className="btn d-block" disabled>
              <Icon def={iconRedo} className="d-block" />
            </button>
          </li>
          <li>
            <div className="vr mx-1" />
          </li>
          <li>
            <button className="btn btn--active d-block">
              <Icon def={iconChecker} className="d-block" />
            </button>
          </li>
          <li>
            <button
              className={classNames('btn d-block', {
                'btn--active': includes(shape.blocks, board.cursor),
              })}
              onClick={this.onToggleBlackClick}
            >
              <Icon def={iconSquare} className="d-block" />
            </button>
          </li>
          <li>
            <button className="btn d-block">
              <Icon def={iconCircle} className="d-block" />
            </button>
          </li>
          <li>
            <button className="btn d-block" onClick={this.onToggleDirectionClick}>
              <Icon def={directionIconDef} className="d-block" />
            </button>
          </li>
          <li>
            <button className="btn d-block">
              <Icon def={iconCursor} className="d-block" />
            </button>
          </li>
        </ul>
      </div>
    );
  }
  render() {
    const { shape } = this.context.getState().editor;
    const wordCounts = getWordCounts(shape);
    const maxGroupLength = maxBy(values(wordCounts), cellGroups => cellGroups.length)!.length;
    return (
      <React.Fragment>
        {this.renderToolbar()}
        <hr className="hr" />
        <div className="bar-graph">
          {range(1, shape.width + 1).map(n => {
            const length = (wordCounts[n]) ? wordCounts[n].length : 0;
            return (
              <div
                key={n}
                className="bar-graph__bar"
                style={{
                  left: (n / shape.width * 90) + 5 + '%',
                  transform: `translateY(-${length / maxGroupLength * 100}%)`,
                }}
              />
            );
          })}
        </div>
      </React.Fragment>
    );
  }
}

export default EditorStructureContainer;
