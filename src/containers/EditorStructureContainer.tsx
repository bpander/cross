import React from 'react';
import { connect } from 'react-redux';

import Icon from 'icons/Icon';
import iconUndo from 'icons/iconUndo';
import iconRedo from 'icons/iconRedo';
import iconChecker from 'icons/iconChecker';
import iconSquare from 'icons/iconSquare';
import iconCircle from 'icons/iconCircle';

class EditorStructureContainer extends React.Component {

  renderToolbar() {
    return (
      <div className="py-2">
        <button className="btn">
          <Icon def={iconUndo} className="d-block" />
        </button>
        <button className="btn" disabled>
          <Icon def={iconRedo} className="d-block" />
        </button>
        <button className="btn btn--active">
          <Icon def={iconChecker} className="d-block" />
        </button>
        <button className="btn">
          <Icon def={iconSquare} className="d-block" />
        </button>
        <button className="btn">
          <Icon def={iconCircle} className="d-block" />
        </button>
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
