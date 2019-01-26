import reduce from 'lodash/reduce';

import Dictionary from 'definitions/Dictionary';
import { Middleware } from 'lib/createStore';
import { Lens } from 'lib/lens';

// tslint:disable-next-line no-any
const getLocalStorageMiddleware = <T>(prefix: string, lenses: Dictionary<Lens<T, any>>) => {
  const middleware: Middleware<T> = (state, prevState) => {
    return reduce(
      lenses,
      (s, lens, key) => {
        if (!prevState) {
          const storedValue = JSON.parse(localStorage.getItem(prefix + '.' + key)!);
          if (storedValue) {
            return lens.set((defaultState: {}) => ({ ...defaultState, ...storedValue }))(s);
          }
        }
        const newValue = lens.get(state);
        if (!prevState || newValue !== lens.get(prevState)) {
          localStorage.setItem(prefix + '.' + key, JSON.stringify(newValue));
        }
        return state;
      },
      state,
    );
  };
  return middleware;
};

export default getLocalStorageMiddleware;
