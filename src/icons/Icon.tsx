import classNames from 'classnames';
import React from 'react';

import IconDef from './IconDef';

interface IconProps {
  def: IconDef;
  className?: string;
}

class Icon extends React.PureComponent<IconProps> {
  render() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className={classNames('icon', this.props.className)}
      >
        <path d={this.props.def.pathDef} />
      </svg>
    );
  }
}

export default Icon;
