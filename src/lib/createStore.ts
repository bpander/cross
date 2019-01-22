import { Setter, LensImpl } from 'lens.ts';

export interface Middleware<T> {
  (state: T, prevState?: T): T;
}

export interface Listener<T> {
  (newState: T): void;
}

export interface Unlistener {
  (): void;
}

export interface Updater<T, U> {
  (lens: LensImpl<T, U>): Setter<T> | Promise<Setter<T>>;
}


export const compose = <R>(fn1: (a: R) => R, ...fns: Array<(a: R) => R>) =>
  fns.reduce((prevFn, nextFn) => value => prevFn(nextFn(value)), fn1);

export interface Store<T> {
  getState: () => T;
  update: (setter: Setter<T> | Promise<Setter<T>>) => void;
  subscribe: (listener: (newState: T) => void) => Unlistener;
}

const createStore = <T>(initialState: T, middleware: Middleware<T>): Store<T> =>{
  let state: T = middleware(initialState);
  const listeners: Listener<T>[] = [];

  const getState = () => state;
  const update = async (setterWrapper: Setter<T> | Promise<Setter<T>>) => {
    const setter = await setterWrapper;
    const newState = setter(state);
    const prevState = state;
    state = middleware(newState, prevState);
    listeners.forEach(listener => listener(state));
  };
  const subscribe = (listener: Listener<T>): Unlistener => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };

  return { getState, update, subscribe };
};

export default createStore;
