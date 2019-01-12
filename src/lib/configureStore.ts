import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import { AnyAction, applyMiddleware, compose, createStore, Reducer, Store, StoreEnhancer } from 'redux';
import persistState, { mergePersistedState } from 'redux-localstorage';
import filter from 'redux-localstorage-filter';
import adapter from 'redux-localstorage/lib/adapters/localStorage';
import thunk from 'redux-thunk';

import RootState from 'redux-modules/definitions/RootState';
import { createRootReducer } from 'redux-modules/root';

export default (history: History): Store<RootState> => {
  let composeEnhancers = compose;
  /* istanbul ignore next */
  if (process.env.NODE_ENV === 'development') {
    // https://github.com/zalmoxisus/redux-devtools-extension
    // tslint:disable-next-line:no-any
    composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  }

  const rootReducer = createRootReducer(history);
  const reducer = mergePersistedState()(rootReducer) as Reducer<RootState | undefined, AnyAction>;
  const storage = filter([ 'editor' ])(adapter(window.localStorage));
  const enhancer: StoreEnhancer = composeEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      thunk,
    ),
    persistState(storage, 'cross'),
  );
  return createStore<RootState | undefined, AnyAction, {}, {}>(reducer, enhancer);
};
