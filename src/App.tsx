import React from 'react';
import { Route } from 'react-router';

import EditorContainer from 'containers/EditorContainer';
import { StateProvider } from 'state/root';

class App extends React.Component {
  render() {
    return (
      <StateProvider>
        <Route component={EditorContainer} />
      </StateProvider>
    );
  }
}

export default App;
