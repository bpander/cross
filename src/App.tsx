import createBrowserHistory from 'history/createBrowserHistory';
import React from 'react';
import { Route, Router, Switch } from 'react-router';

import EditorContainer from 'containers/EditorContainer';
import createStore from 'lib/createStore';
import getHistoryMiddleware from 'lib/getHistoryMiddleware';
import getLocalStorageMiddleware from 'lib/getLocalStorageMiddleware';
import { Provider } from 'lib/react-store';
import { defaultValue, editorBoardLens, editorHistoryLens, editorLens, editorShapeLens } from 'state/root';

const history = createBrowserHistory();

const store = createStore(
  defaultValue,
  getLocalStorageMiddleware('cross', { 'board': editorBoardLens, 'shape': editorShapeLens }),
  getHistoryMiddleware(
    editorLens.get(),
    editorHistoryLens,
    [ editorBoardLens.k('letters').get(), editorShapeLens.k('blocks').get() ],
    200,
  ),
);

class App extends React.Component {
  render() {
    return (
      <Router history={history}>
        <Provider store={store}>
          <Switch>
            <Route component={EditorContainer} />
          </Switch>
        </Provider>
      </Router>
    );
  }
}

export default App;
