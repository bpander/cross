import React from 'react';
import { Route } from 'react-router';

import EditorContainer from 'containers/EditorContainer';
import createStore, { compose } from 'lib/createStore';
import getLocalStorageMiddleware from 'lib/getLocalStorageMiddleware';
import { Provider } from 'lib/react-store';
import { defaultValue, editorBoardLens, editorShapeLens } from 'state/root';

const store = createStore(
  defaultValue,
  compose(
    getLocalStorageMiddleware('cross', { 'board': editorBoardLens, 'shape': editorShapeLens }),
  ),
);

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Route component={EditorContainer} />
      </Provider>
    );
  }
}

export default App;
