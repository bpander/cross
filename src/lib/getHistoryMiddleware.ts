import { Getter, LensImpl } from 'lens.ts';
import { Middleware, SetterCreator } from 'lib/createStore';

export interface History<T> {
  past: T[];
  lastSavedState: T;
  future: T[];
}

const getHistoryMiddleware = <T, U>(l: LensImpl<T, U>, hl: LensImpl<T, History<U>>, triggers: Getter<T, {}>[]): Middleware<T> => {
  return (state, prevState) => {
    if (!prevState) {
      return state;
    }
    const previous = l.get()(prevState);
    const current = l.get()(state);
    if (previous === current) {
      return state;
    }
    const history = hl.get()(state);
    if (getLast(history) === current) {
      return hl.set(() => {
        const newPast = history.past.slice(0, -1);
        console.log(history.past);
        const newFuture = [ history.lastSavedState, ...history.future ];
        return { past: newPast, future: newFuture, lastSavedState: current };
      })(state);
    }
    if (getNext(history) === current) {
      return hl.set(() => {
        const newPast = [ ...history.past, history.lastSavedState ];
        const newFuture = history.future.slice(1);
        return { past: newPast, future: newFuture, lastSavedState: current };
      })(state);
    }
    if (triggers.some(t => t(state) !== t(prevState))) {
      return hl.set(() => {
        const newPast = [ ...history.past, previous ];
        return { past: newPast, future: [], lastSavedState: current };
      })(state);
    }

    return state;
  };
};

export default getHistoryMiddleware;

export const getLast = <U>(history: History<U>): U | undefined => {
  return history.past[history.past.length - 1];
};

export const getNext = <U>(history: History<U>): U | undefined => {
  return history.future[0];
};

const identity = <T>(x: T): T => x;

export const undo: SetterCreator<{}> = l => <U>(history: History<U>) => {
  const last = getLast(history);
  if (!last) {
    return l.set(identity);
  }
  return l.set(last);
};

export const redo: SetterCreator<{}> = l => <U>(history: History<U>) => {
  const next = getNext(history);
  if (!next) {
    return l.set(identity);
  }
  return l.set(next);
};
