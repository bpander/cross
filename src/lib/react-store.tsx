import React from 'react';

import { Store, Unsubscribe } from 'lib/createStore';

interface ContextValue<T> {
  store: Store<T> | null;
}

interface ProviderProps<T> {
  store: Store<T>;
}

interface ProviderState<T> {
  storeState: T;
}

// tslint:disable-next-line no-any
const StoreContext = React.createContext<ContextValue<any>>({ store: null });

export class Provider<T> extends React.Component<ProviderProps<T>, ProviderState<T>> {

  unsubscribe: Unsubscribe | null = null;

  constructor(props: ProviderProps<T>) {
    super(props);
    this.state = {
      storeState: this.props.store.getState(),
    };
  }

  componentDidMount() {
    this.subscribe();
  }

  componentDidUpdate(prevProps: ProviderProps<T>) {
    if (this.props.store !== prevProps.store) {
      if (this.unsubscribe) { this.unsubscribe(); }
      this.subscribe();
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) { this.unsubscribe(); }
  }

  subscribe() {
    const { store } = this.props;
    this.unsubscribe = store.subscribe(newStoreState => {
      this.setState(providerState => {
        if (providerState.storeState === newStoreState) {
          return null;
        }
        return { storeState: newStoreState };
      });
    });
  }

  render() {
    return (
      <StoreContext.Provider value={{ store: this.props.store }}>
        {this.props.children}
      </StoreContext.Provider>
    );
  }
}

export interface MapStoreToProps<T, TOwnProps, P> {
  (store: Store<T>, ownProps: TOwnProps): P;
}

export const injectStore = function<T, TOwnProps, P>(mapStoreToProps: MapStoreToProps<T, TOwnProps, P>) {
  return (Component: React.ComponentType<P>) => {
    return class WrappedComponent extends React.Component<TOwnProps> {
      innerRender = (value: ContextValue<T>) => (
        value.store && <Component {...mapStoreToProps(value.store, this.props)} />
      );

      render() {
        return <StoreContext.Consumer>{this.innerRender}</StoreContext.Consumer>;
      }
    };
  };
};
