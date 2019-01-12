import React from 'react';
import { connect } from 'react-redux';

import { ContainerProps } from 'containers/definitions/Containers';
import { autoFill } from 'lib/crossword/solver';
import { editorSelectors } from 'redux-modules/editor';
import { rootSelectors } from 'redux-modules/root';
import { shapeSelectors } from 'redux-modules/shape';
import { mapValues } from 'util/objects';

class EditorFillContainer extends React.Component<ContainerProps> {

  componentDidUpdate(prevProps: ContainerProps) {
    const slots = shapeSelectors.getSlots(this.props.editor.shape);
    const wordGetters = rootSelectors.getFittingWordsGetters(this.props);
    const fittingWords = mapValues(wordGetters, getter => getter(this.props.editor.board));
    const usedWords = editorSelectors.getUsedWords(this.props.editor);
    console.log('starting fill...');
    const start = Date.now();
    const res = autoFill(this.props.editor.board.letters, slots, fittingWords, usedWords);
    console.log((Date.now() - start) + 'ms', res);
  }

  render() {
    return (
      <div>Fill</div>
    );
  }
}

export default connect(state => state)(EditorFillContainer);
