import React from 'react';
import { connect } from 'react-redux';

import { ContainerProps } from 'containers/definitions/Containers';
import { autoFill } from 'lib/crossword';
import { boardSelectors } from 'redux-modules/board';
import { rootSelectors } from 'redux-modules/root';

class EditorFillContainer extends React.Component<ContainerProps> {

  componentDidUpdate(prevProps: ContainerProps) {
    const prevSlot = boardSelectors.getSlotAtCursor(prevProps.board);
    const slot = boardSelectors.getSlotAtCursor(this.props.board);
    if (slot && prevSlot !== slot) {
      const fittingWords = rootSelectors.getFittingWords(this.props);
      const slots = boardSelectors.getSlots(this.props.board);
      console.log('filling...'); // tslint:disable-line no-console
      const autoFillResult = autoFill(this.props.board.grid, slots, fittingWords, []);
      console.log(autoFillResult); // tslint:disable-line no-console
    }
  }

  render() {
    return (
      <div>Fill</div>
    );
  }
}

export default connect(state => state)(EditorFillContainer);
