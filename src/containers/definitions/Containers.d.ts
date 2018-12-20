import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import RootState from 'redux-modules/definitions/RootState';

export type ContainerProps = RootState & { dispatch: ThunkDispatch<RootState, undefined, AnyAction>; };

export interface MapStateToContainerProps {
  (rootState: RootState): RootState;
}
