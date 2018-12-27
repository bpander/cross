import { faDelicious } from '@fortawesome/free-brands-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faRedoAlt, faSquare, faUndoAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router';

import Tabs, { Tab } from 'components/Tabs';
import BoardContainer from 'containers/BoardContainer';
import { ContainerProps } from 'containers/definitions/Containers';

type EditorProps = ContainerProps<{ puzzleId?: string; }>;

interface EditorContainerState {
  tab: number;
}

class EditorContainer extends React.Component<EditorProps, EditorContainerState> {

  static tabs: Tab[] = [
    {
      label: 'Structure',
      panel: () => (
        <div>
          <button className="btn">
            <FontAwesomeIcon fixedWidth size="lg" icon={faUndoAlt} />
          </button>
          <button className="btn" disabled>
            <FontAwesomeIcon fixedWidth size="lg" icon={faRedoAlt} />
          </button>
          <button className="btn btn--active">
            <FontAwesomeIcon fixedWidth size="lg" icon={faDelicious} />
          </button>
          <button className="btn">
            <FontAwesomeIcon fixedWidth size="lg" icon={faSquare} />
          </button>
          <button className="btn">
            <FontAwesomeIcon fixedWidth size="lg" icon={faCircle} />
          </button>
        </div>
      ),
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

  onTabChange = (tab: number) => {
    this.setState({ tab });
  };

  render() {
    return (
      <div className="grid">
        <div className="grid__col">
          <Route component={BoardContainer} />
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
