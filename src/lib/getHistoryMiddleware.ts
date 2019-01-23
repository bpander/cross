import { Getter, LensImpl } from 'lens.ts';
import { Middleware } from 'lib/createStore';

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
      // TODO: user UNdid
      return state;
    }
    const indexInFuture = future.indexOf(current);
    if (indexInFuture > -1) {
      // TODO: user REdid
      return state;
    }
    if (triggers.some(t => t(state) !== t(prevState))) {
      return hl.k('past').set(pastState => [ ...pastState, previous ])(state);
    }

    return state;
  };
};

export default getHistoryMiddleware;
