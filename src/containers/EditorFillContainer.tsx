// tslint:disable no-console
// TODO: ^Remove when no longer needed
import React from 'react';
import { connect } from 'react-redux';

import { ContainerProps } from 'containers/definitions/Containers';
import WorkerPool from 'lib/WorkerPool';
import { editorSelectors } from 'redux-modules/editor';
import { rootSelectors } from 'redux-modules/root';
import { shapeSelectors } from 'redux-modules/shape';
import { mapValues } from 'util/objects';

class EditorFillContainer extends React.Component<ContainerProps> {

  workerPool: WorkerPool;

  constructor(props: ContainerProps) {
    super(props);
    this.workerPool = new WorkerPool('solver.worker.js', 8);
  }

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
    this.workerPool.killAll();
    fittingWords[slot.id]!.forEach(word => {
      this.workerPool.enqueue(worker => {
        return new Promise(resolve => {
          const timeoutId = setTimeout(
            () => {
              resolve(worker);
              console.log('worker timed out', slot.id, word);
            },
            1000 * 20,
          );
          worker.postMessage({ grid: letters, slots, fittingWords, usedWords, word, slot });
          worker.addEventListener('message', e => {
            clearTimeout(timeoutId);
            console.log(e.data);
            resolve(worker);
          });
        });
      });
    });
  }

  componentWillUnmount() {
    this.workerPool.killAll();
  }

  render() {
    return (
      <div>Fill</div>
    );
  }
}

export default connect(state => state)(EditorFillContainer);
