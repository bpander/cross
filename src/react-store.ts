import React from 'react';

import createStore, { compose } from 'lib/createStore';
import getLocalStorageMiddleware from 'lib/getLocalStorageMiddleware';
import { defaultValue, editorBoardLens, editorShapeLens } from 'state/root';

export const store = createStore(
  defaultValue,
  compose(
    getLocalStorageMiddleware('cross', { 'board': editorBoardLens, 'shape': editorShapeLens }),
  ),
);

export const StoreContext = React.createContext(store);
