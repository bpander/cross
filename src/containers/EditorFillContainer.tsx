// tslint:disable no-console
// TODO: ^Remove when no longer needed
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { ContainerProps } from 'containers/definitions/Containers';
import { Constraints } from 'lib/crossword/Types';
import ThreadPool, { Thread } from 'lib/ThreadPool';
import { editorSelectors } from 'redux-modules/editor';
import { rootSelectors } from 'redux-modules/root';
import { shapeSelectors } from 'redux-modules/shape';

class EditorFillContainer extends React.Component<ContainerProps> {

  threadPool: ThreadPool<string>;

  getConstraints = createSelector(
    (props: ContainerProps) => shapeSelectors.getSlots(props.editor.shape),
    (props: ContainerProps) => rootSelectors.getFittingWords(props),
    (props: ContainerProps) => editorSelectors.getSlotAtCursor(props.editor),
    (props: ContainerProps) => editorSelectors.getClosedSet(props.editor),
    (slots, fittingWords, slot, closedSet) => {
      if (!slot) {
        return null;
      }
      const constraints: Constraints = { slots, fittingWords, slot, closedSet };
      return constraints;
    },
  );

  evaluateCandidates = createSelector(
    (props: ContainerProps) => editorSelectors.getSlotAtCursor(props.editor),
    (props: ContainerProps) => {
      const slot = editorSelectors.getSlotAtCursor(props.editor);
      if (!slot) {
        return [];
      }
      const getters = rootSelectors.getFittingWordsGetters(props);
      return getters[slot.id](props.editor.board.letters) || [];
    },
    (slot, fittingWordsAtSlot) => {
      this.threadPool.killAll();
      if (fittingWordsAtSlot.length) {
        this.threadPool.enqueue(fittingWordsAtSlot);
      }
    },
  );

  constructor(props: ContainerProps) {
    super(props);
    this.threadPool = new ThreadPool('solver.worker.js', {
      limit: 8,
      timeout: 1000 * 10,
      onThreadCreated: this.onThreadCreated,
      onThreadReady: this.onThreadReady,
      onThreadTimeout: this.onThreadTimeout,
    });
  }

  componentDidUpdate() {
    setTimeout(() => this.evaluateCandidates(this.props), 0);
  }

  componentWillUnmount() {
    this.threadPool.killAll();
  }

  onThreadCreated = (thread: Thread<string>) => {
    thread.worker.postMessage({
      type: 'prepare',
      payload: this.getConstraints(this.props),
    });
  };

  onThreadReady = (thread: Thread<string>) => {
    thread.worker.onmessage = e => {
      if (e.data.res.success) {
        console.log('success', e.data);
      } else {
        console.log('fail', thread.datum);
      }
      thread.deferred.resolve();
    };
    thread.worker.postMessage({ type: 'process', payload: thread.datum });
  };

  onThreadTimeout = (thread: Thread<string>) => {
    console.log('timeout', thread.datum);
  };

  render() {
    return (
      <div>Fill</div>
    );
  }
}

export default connect(state => state)(EditorFillContainer);
