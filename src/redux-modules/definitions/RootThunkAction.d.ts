import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';

import RootState from 'redux-modules/definitions/RootState';

type RootThunkAction<R> = ThunkAction<R, RootState, undefined, Action>;

export default RootThunkAction;
