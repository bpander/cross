import React from 'react';
import { Route } from 'react-router';

import BoardContainer from 'containers/BoardContainer';

class App extends React.Component {
  render() {
    return (
      <Route component={BoardContainer} />
    );
  }
}

export default App;
