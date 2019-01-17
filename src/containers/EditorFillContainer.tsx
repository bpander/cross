// tslint:disable no-console
// TODO: ^Remove when no longer needed
import React from 'react';
import { connect } from 'react-redux';

import { ContainerProps } from 'containers/definitions/Containers';
import ThreadPool, { Thread } from 'lib/ThreadPool';
import { editorSelectors } from 'redux-modules/editor';
import { rootSelectors } from 'redux-modules/root';
import { shapeSelectors } from 'redux-modules/shape';
import { mapValues } from 'util/objects';

class EditorFillContainer extends React.Component<ContainerProps> {

  threadPool: ThreadPool<string>;

  constructor(props: ContainerProps) {
    super(props);
    this.threadPool = new ThreadPool('solver.worker.js', {
      limit: 8,
      timeout: 1000 * 10,
      onThreadCreated: () => {},
      onThreadReady: this.onThreadReady,
      onThreadTimeout: this.onThreadTimeout,
    });
  }

  onThreadTimeout = (thread: Thread<string>) => {
    console.log('timeout', thread.datum);
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

  componentDidUpdate(prevProps: ContainerProps) {
    const prevSlot = editorSelectors.getSlotAtCursor(prevProps.editor);
    const slot = editorSelectors.getSlotAtCursor(this.props.editor);
    if (!slot) {
      this.threadPool.killAll();
      return;
    }
    if (slot === prevSlot) {
      console.log('same');
      return;
    }
    const slots = shapeSelectors.getSlots(this.props.editor.shape);
    const wordGetters = rootSelectors.getFittingWordsGetters(this.props);
    const fittingWords = mapValues(wordGetters, getter => getter(this.props.editor.board));
    const fittingWordsAtSlot = fittingWords[slot.id];
    if (!fittingWordsAtSlot) {
      console.log('closed');
      return;
    }
    if (!fittingWordsAtSlot.length) {
      console.log('no fitting words');
    }
    const usedWords = editorSelectors.getUsedWords(this.props.editor);
    const { letters } = this.props.editor.board;
    this.threadPool.killAll();
    this.threadPool.config.onThreadCreated = thread => {
      thread.worker.postMessage({
        type: 'prepare',
        payload: { grid: letters, slots, fittingWords, usedWords, slot },
      });
    };
    this.threadPool.enqueue(fittingWordsAtSlot);
  }

  componentWillUnmount() {
    this.threadPool.killAll();
  }

  render() {
    return (
      <div>Fill</div>
    );
  }
}

export default connect(state => state)(EditorFillContainer);
