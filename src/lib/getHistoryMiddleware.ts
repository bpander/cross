import { Getter, LensImpl } from 'lens.ts';
import { Middleware, SetterCreator } from 'lib/createStore';

export interface History<T> {
  past: T[];
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
    const { past, future } = hl.get()(state);
    const indexInPast = past.indexOf(current);
    if (indexInPast > -1) {
      return hl.set(() => {
        const newPast = past.slice(0, indexInPast);
        const newFuture = [ ...past.slice(indexInPast + 1), previous, ...future ];
        return { past: newPast, future: newFuture };
      })(state);
    }
    const indexInFuture = future.indexOf(current);
    if (indexInFuture > -1) {
      return hl.set(() => {
        const newPast = [ ...past, previous, ...future.slice(0, indexInFuture) ];
        const newFuture = future.slice(indexInFuture + 1);
        return { past: newPast, future: newFuture };
      })(state);
    }
    if (triggers.some(t => t(state) !== t(prevState))) {
      return hl.set(() => {
        const newPast = [ ...past, previous ];
        return { past: newPast, future: [] };
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
