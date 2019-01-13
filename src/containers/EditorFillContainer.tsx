import React from 'react';
import { connect } from 'react-redux';

import { ContainerProps } from 'containers/definitions/Containers';
import { editorSelectors } from 'redux-modules/editor';
import { rootSelectors } from 'redux-modules/root';
import { shapeSelectors } from 'redux-modules/shape';
import { mapValues } from 'util/objects';

const worker = new Worker('solver.worker.js');
worker.addEventListener('message', e => console.log(e.data));

class EditorFillContainer extends React.Component<ContainerProps> {

  componentDidUpdate() {
    const slot = editorSelectors.getSlotAtCursor(this.props.editor);
    if (!slot) {
      return;
    }
    const slots = shapeSelectors.getSlots(this.props.editor.shape);
    const wordGetters = rootSelectors.getFittingWordsGetters(this.props);
    const fittingWords = mapValues(wordGetters, getter => getter(this.props.editor.board));
    if (!fittingWords[slot.id]) {
      return;
    }
    const usedWords = editorSelectors.getUsedWords(this.props.editor);
    const { letters } = this.props.editor.board;
    const word = fittingWords[slot.id]![0];
    console.log('starting fill...');
    const start = Date.now();
    worker.postMessage({ grid: letters, slots, fittingWords, usedWords, word, slot });
    console.log((Date.now() - start) + 'ms');
  }

  render() {
    return (
      <div>Fill</div>
    );
  }
}

export default connect(state => state)(EditorFillContainer);
