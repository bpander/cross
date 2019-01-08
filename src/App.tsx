import React from 'react';
import { add, Trie, only } from 'lib/tries';
import { Route } from 'react-router';

import EditorContainer from 'containers/EditorContainer';

class App extends React.Component {

  componentDidMount() {
    const words = [
      'about',
      'after',
      'dares',
      'first',
      'going',
      'other',
      'pupil',
      'right',
      'still',
      'there',
      'think',
      'wirer',
    ];
    console.log(words.length, 'words');
    const all: Trie = words.reduce((p, c) => add(p, c), { size: 0, children: {} });
    const sum = Object.keys(all.children).reduce((p, c) => p + all.children[c].size, 0);
    console.log({ sum });
    console.log(all);
    console.log(only(all, 1, 'h'));
  }

  render() {
    return (
      <Route component={EditorContainer} />
    );
  }
}

export default App;
