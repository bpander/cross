import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RouteComponentProps } from 'react-router';

import RootState from 'redux-modules/definitions/RootState';

export type ContainerProps<P = {}> = RouteComponentProps<P> & RootState & { dispatch: ThunkDispatch<RootState, undefined, AnyAction>; };

export interface MapStateToContainerProps {
  (rootState: RootState): RootState;
}
