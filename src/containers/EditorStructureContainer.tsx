import React from 'react';
import { connect } from 'react-redux';

import Icon from 'icons/Icon';
import iconChecker from 'icons/iconChecker';
import iconCircle from 'icons/iconCircle';
import iconCursor from 'icons/iconCursor';
import iconRedo from 'icons/iconRedo';
import iconSquare from 'icons/iconSquare';
import iconTextRotationNone from 'icons/iconTextRotationNone';
import iconUndo from 'icons/iconUndo';

class EditorStructureContainer extends React.Component {

  renderToolbar() {
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
            <button className="btn d-block">
              <Icon def={iconSquare} className="d-block" />
            </button>
          </li>
          <li>
            <button className="btn d-block">
              <Icon def={iconCircle} className="d-block" />
            </button>
          </li>
          <li>
            <button className="btn d-block">
              <Icon def={iconTextRotationNone} className="d-block" />
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
    return (
      <React.Fragment>
        {this.renderToolbar()}
        <hr className="hr" />
      </React.Fragment>
    );
  }
}

export default connect(state => state)(EditorStructureContainer);
