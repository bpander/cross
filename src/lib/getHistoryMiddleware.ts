import { Middleware } from 'lib/createStore';
import { Getter, Lens, Setter } from 'lib/lens';

export interface UndoHistory<T> {
  past: T[];
  lastSavedState: T | null;
  future: T[];
}

// tslint:disable-next-line no-any
export const emptyUndoHistory: UndoHistory<any> = {
  past: [],
  lastSavedState: null,
  future: [],
};

const identity = <T>(x: T): T => x;

export const getLast = <U>(history: UndoHistory<U>): U | undefined => {
  return history.past[history.past.length - 1];
};

export const getNext = <U>(history: UndoHistory<U>): U | undefined => {
  return history.future[0];
};

interface GetHistoryMiddleware {
  <T, U>(
    get: Getter<T, U>,
    hl: Lens<T, UndoHistory<U>>,
    triggers: Getter<T, {}>[],
    limit: number,
  ): Middleware<T>;
}

const push = <T>(arr: T[], item: T | null): T[] => {
  return (item) ? [ ...arr, item ] : arr;
};

const unshift = <T>(arr: T[], item: T | null): T[] => {
  return (item) ? [ item, ...arr ] : arr;
};

const getHistoryMiddleware: GetHistoryMiddleware = (get, hl, triggers, limit) => {
  return (state, prevState) => {
    if (!prevState) {
      return state;
    }
    const previous = get(prevState);
    const current = get(state);
    if (previous === current) {
      return state;
    }
    return hl.set(history => {
      if (getLast(history) === current) {
        return {
          past: history.past.slice(0, -1),
          lastSavedState: current,
          future: unshift(history.future, history.lastSavedState),
        };
      }
      if (getNext(history) === current) {
        return {
          past: push(history.past, history.lastSavedState),
          lastSavedState: current,
          future: history.future.slice(1),
        };
      }
      if (triggers.some(t => t(state) !== t(prevState))) {
        return {
          past: [ ...history.past, previous ].slice(limit * -1),
          lastSavedState: current,
          future: [],
        };
      }
      return history;
    })(state);
  };
};

export default getHistoryMiddleware;

export const undo = <U>(history: UndoHistory<U>): Setter<U> => {
  const last = getLast(history);
  if (!last) {
    return identity;
  }
  return () => last;
};

export const redo = <U>(history: UndoHistory<U>): Setter<U> => {
  const next = getNext(history);
  if (!next) {
    return identity;
  }
  return () => next;
};
