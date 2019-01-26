import { LensImpl, Setter } from 'lib/lens';

export interface Middleware<T> {
  (state: T, prevState?: T): T;
}

export interface SetterCreator<U> {
  // tslint:disable-next-line no-any
  <T>(l: LensImpl<T, U>): (...args: any[]) => Setter<T>;
}

export interface AsyncSetterCreator<U> {
  // tslint:disable-next-line no-any
  <T>(l: LensImpl<T, U>): (...args: any[]) => Promise<Setter<T>>;
}

export interface Listener<T> {
  (newState: T): void;
}

export interface Unsubscribe {
  (): void;
}

export const compose = <R>(fn1: (a: R) => R, ...fns: Array<(a: R) => R>) =>
  fns.reduce((prevFn, nextFn) => value => prevFn(nextFn(value)), fn1);

export interface Store<T> {
  getState: () => T;
  update: (setter: Setter<T>) => void;
  subscribe: (listener: (newState: T) => void) => Unsubscribe;
}

const createStore = <T>(initialState: T, ...middleware: Middleware<T>[]): Store<T> => {
  let state: T = middleware.reduce((s, m) => m(s), initialState);
  const listeners: Listener<T>[] = [];

  const getState = () => state;
  const update = async (setter: Setter<T>) => {
    const newState = setter(state);
    const prevState = state;
    state = middleware.reduce((s, m) => m(s, prevState), newState);
    listeners.forEach(listener => listener(state));
  };
  const subscribe = (listener: Listener<T>): Unsubscribe => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };

  return { getState, update, subscribe };
};

export default createStore;
