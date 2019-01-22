import React from 'react';
import { Route } from 'react-router';

import EditorContainer from 'containers/EditorContainer';
import { StoreContext, store } from 'react-store';

class App extends React.Component {
  componentDidMount() {
    store.subscribe(() => this.forceUpdate());
  }
  render() {
    console.log('render', store.getState());
    return (
      <StoreContext.Provider value={store}>
        <Route component={EditorContainer} />
      </StoreContext.Provider>
    );
  }
}

export default App;
