import React from 'react';

import createStore, { compose } from 'lib/createStore';
import { defaultValue, editorBoardLens, editorShapeLens } from 'state/root';
import getLocalStorageMiddleware from 'lib/getLocalStorageMiddleware';

export const store = createStore(
  defaultValue,
  compose(
    getLocalStorageMiddleware('cross', { 'board': editorBoardLens, 'shape': editorShapeLens }),
  ),
);

export const StoreContext = React.createContext(store);
