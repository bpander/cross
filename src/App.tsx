import React from 'react';
import { Route } from 'react-router';

import EditorContainer from 'containers/EditorContainer';

class App extends React.Component {
  render() {
    return (
      <Route component={EditorContainer} />
    );
  }
}

export default App;
