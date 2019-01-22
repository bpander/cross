// tslint:disable no-console
// TODO: ^Remove when no longer needed
import React from 'react';
import { createSelector } from 'reselect';

import { ContainerProps } from 'containers/definitions/Containers';
import { Constraints } from 'lib/crossword/Types';
import ThreadPool, { Thread } from 'lib/ThreadPool';
import { getFittingWords, getFittingWordsGetters, RootState } from 'state/root';
import { getSlots } from 'state/shape';
import { getClosedSet, getSlotAtCursor } from 'state/viewer';
import { StoreContext } from 'react-store';

class EditorFillContainer extends React.Component<ContainerProps> {

  static contextType = StoreContext;
  context!: React.ContextType<typeof StoreContext>;

  threadPool: ThreadPool<string>;

  getConstraints = createSelector(
    (state: RootState) => getSlots(state.editor.shape),
    (state: RootState) => getFittingWords(state),
    (state: RootState) => getSlotAtCursor(state.editor),
    (state: RootState) => getClosedSet(state.editor),
    (slots, fittingWords, slot, closedSet) => {
      if (!slot) {
        return null;
      }
      const constraints: Constraints = { slots, fittingWords, slot, closedSet };
      return constraints;
    },
  );

  evaluateCandidates = createSelector(
    (state: RootState) => getSlotAtCursor(state.editor),
    (state: RootState) => {
      const slot = getSlotAtCursor(state.editor);
      if (!slot) {
        return [];
      }
      const getters = getFittingWordsGetters(state);
      return getters[slot.id](state.editor.board.letters) || [];
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
      onQueueEmpty: () => console.log('done'),
    });
  }

  componentDidUpdate() {
    setTimeout(() => this.evaluateCandidates(this.context.getState()), 0);
  }

  componentWillUnmount() {
    this.threadPool.killAll();
  }

  onThreadCreated = (thread: Thread<string>) => {
    thread.worker.postMessage({
      type: 'prepare',
      payload: this.getConstraints(this.context.getState()),
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

export default EditorFillContainer;
