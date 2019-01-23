import React from 'react';
import { Route } from 'react-router';

import EditorContainer from 'containers/EditorContainer';
import createStore from 'lib/createStore';
import getHistoryMiddleware from 'lib/getHistoryMiddleware';
import getLocalStorageMiddleware from 'lib/getLocalStorageMiddleware';
import { Provider } from 'lib/react-store';
import { defaultValue, editorBoardLens, editorHistoryLens, editorLens, editorShapeLens } from 'state/root';

const store = createStore(
  defaultValue,
  getLocalStorageMiddleware('cross', { 'board': editorBoardLens, 'shape': editorShapeLens }),
  getHistoryMiddleware(
    editorLens,
    editorHistoryLens,
    [ editorBoardLens.k('letters').get(), editorShapeLens.k('blocks').get() ],
    // TODO: Add undo limit
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
