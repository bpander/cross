import React from 'react';
import { connect } from 'react-redux';

import { ContainerProps } from 'containers/definitions/Containers';
import { autoFill } from 'lib/crossword/solver';
import { editorSelectors } from 'redux-modules/editor';
import { rootSelectors } from 'redux-modules/root';
import { shapeSelectors } from 'redux-modules/shape';

class EditorFillContainer extends React.Component<ContainerProps> {

  componentDidUpdate(prevProps: ContainerProps) {
    const prevSlot = editorSelectors.getSlotAtCursor(prevProps.editor);
    const slot = editorSelectors.getSlotAtCursor(this.props.editor);
    if (slot && prevSlot !== slot) {
      const fittingWords = rootSelectors.getFittingWords(this.props);
      const slots = shapeSelectors.getSlots(this.props.editor.shape);
      const shouldFill = true;
      if (shouldFill) {
        const start = Date.now();
        console.log('filling...'); // tslint:disable-line no-console
        const autoFillResult = autoFill(this.props.editor.board.letters, slots, fittingWords, []);
        console.log(Date.now() - start, autoFillResult); // tslint:disable-line no-console
      }
    }
  }

  render() {
    return (
      <div>Fill</div>
    );
  }
}

export default connect(state => state)(EditorFillContainer);
