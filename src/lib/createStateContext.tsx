import React from 'react';

export interface Middleware<T> {
  (state: T, prevState?: T): T;
}

interface Update<T> {
  (newState: T): void;
}

export interface Store<T> {
  state: T;
  update: Update<T>;
}

const noop = () => {}; // tslint:disable-line no-empty

export default function createStateContext<T>(defaultValue: T, middlewares: Middleware<T>[]) {

  const initial: Store<T> = { state: defaultValue, update: noop };
  const StateContext = React.createContext(initial);

  class StateProvider extends React.Component<{}, Store<T>> {

    constructor(props: {}) {
      super(props);
      this.state = {
        state: defaultValue,
        update: this.update,
      };
    }

    update: Update<T> = (newState: T) => {
      const state = middlewares.reduce((s, m) => m(s, this.state.state), newState);
      this.setState({ state });
    };

    render() {
      return (
        <StateContext.Provider value={this.state}>
          {this.props.children}
        </StateContext.Provider>
      );
    }
  }

  return { StateContext, StateProvider };
}
