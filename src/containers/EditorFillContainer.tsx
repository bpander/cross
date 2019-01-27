// tslint:disable no-console
// TODO: ^Remove when no longer needed
import React from 'react';
import { createSelector } from 'reselect';

import { Constraints, ClosedSet } from 'lib/crossword/Types';
import { injectStore } from 'lib/react-store';
import ThreadPool, { Thread } from 'lib/ThreadPool';
import { getFittingWords, RootState, getFittingWordsAtSlot } from 'state/root';
import { getSlots } from 'state/shape';
import { getClosedSet, getSlotAtCursor } from 'state/viewer';
import { ContainerProps, mapStoreToContainerProps } from './container';

enum EvaluationStatus {
  Processing,
  Succeeded,
  Failed,
  TimedOut,
}

interface EvaluationBase<T> {
  status: T;
  slotId: string;
  wordKey: string;
}

type EvaluationProcessing = EvaluationBase<EvaluationStatus.Processing>;
type EvaluationFailed = EvaluationBase<EvaluationStatus.Failed>;
type EvaluationTimedOut = EvaluationBase<EvaluationStatus.TimedOut>;
type EvaluationSucceeded = EvaluationBase<EvaluationStatus.Succeeded> & { closedSet: ClosedSet; };

type Evaluation = EvaluationProcessing | EvaluationFailed | EvaluationTimedOut | EvaluationSucceeded;

interface EditorFillContainerState {
  evaluations: { [wordKey: string]: Evaluation };
}

class EditorFillContainer extends React.Component<ContainerProps, EditorFillContainerState> {

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
    getFittingWordsAtSlot,
    fittingWordsAtSlot => {
      this.threadPool.killAll();
      if (fittingWordsAtSlot.length) {
        this.threadPool.enqueue(fittingWordsAtSlot.slice(0, 100));
      }
    },
  );

  constructor(props: ContainerProps) {
    super(props);
    this.state = {
      evaluations: {},
    };
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
    const slotAtCursor = getSlotAtCursor(this.props.editor);
    if (!slotAtCursor) {
      return;
    }
    thread.worker.onmessage = e => {
      if (e.data.res.success) {
        const evaluation: EvaluationSucceeded = {
          status: EvaluationStatus.Succeeded,
          slotId: slotAtCursor.id,
          wordKey: thread.datum,
          closedSet: e.data.res.closedSet,
        };
        this.setState({
          evaluations: { ...this.state.evaluations, [evaluation.wordKey]: evaluation },
        });
      } else {
        const evaluation: EvaluationFailed = {
          status: EvaluationStatus.Failed,
          slotId: slotAtCursor.id,
          wordKey: thread.datum,
        };
        this.setState({
          evaluations: { ...this.state.evaluations, [evaluation.wordKey]: evaluation },
        });
        console.log('fail', thread.datum);
      }
      thread.deferred.resolve();
    };
    thread.worker.postMessage({ type: 'process', payload: thread.datum });
    const evaluation: EvaluationProcessing = {
      status: EvaluationStatus.Processing,
      wordKey: thread.datum,
      slotId: slotAtCursor.id,
    };
    this.setState({
      evaluations: { ...this.state.evaluations, [evaluation.wordKey]: evaluation },
    });
  };

  onThreadTimeout = (thread: Thread<string>) => {
    const slotAtCursor = getSlotAtCursor(this.props.editor);
    if (!slotAtCursor) {
      return;
    }
    const evaluation: EvaluationTimedOut = {
      status: EvaluationStatus.TimedOut,
      wordKey: thread.datum,
      slotId: slotAtCursor.id,
    };
    this.setState({
      evaluations: { ...this.state.evaluations, [evaluation.wordKey]: evaluation },
    });
  };

  render() {
    const fittingWordsAtSlot = getFittingWordsAtSlot(this.props);
    return (
      <div>
        <div>Fill</div>
        <table>
          <tbody>
            {fittingWordsAtSlot.slice(0, 100).map(word => (
              <tr key={word} tabIndex={0}>
                <td>{this.state.evaluations[word] && this.state.evaluations[word].status}</td>
                <td>{word}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default injectStore(mapStoreToContainerProps)(EditorFillContainer);
