import createBrowserHistory from 'history/createBrowserHistory';
import React from 'react';
import { Route, Router, Switch } from 'react-router';

import EditorContainer from 'containers/EditorContainer';
import createStore from 'lib/createStore';
import getHistoryMiddleware from 'lib/getHistoryMiddleware';
import getLocalStorageMiddleware from 'lib/getLocalStorageMiddleware';
import { Provider } from 'lib/react-store';
import { defaultValue, L } from 'state/root';

const history = createBrowserHistory();

const store = createStore(
  defaultValue,
  getLocalStorageMiddleware('cross', { 'board': L.editor.board, 'shape': L.editor.shape }),
  getHistoryMiddleware(
    L.editor.get(),
    L.editorHistory,
    [ L.editor.board.k('letters').get(), L.editor.shape.k('blocks').get() ],
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
