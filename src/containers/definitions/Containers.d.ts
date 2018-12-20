import RootState from 'redux-modules/definitions/RootState';

export type ContainerProps = RootState;

export interface MapStateToContainerProps {
  (rootState: RootState): RootState;
}
