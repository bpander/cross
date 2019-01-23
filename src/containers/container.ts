import { Store } from 'lib/createStore';
import { MapStoreToProps } from 'lib/react-store';
import { RouteComponentProps } from 'react-router';
import { RootState } from 'state/root';

interface UpdateProp {
  update: Store<RootState>['update'];
}
export type ContainerProps<P = {}> = RootState & RouteComponentProps<P> & UpdateProp;

type MapStoreToContainerProps = MapStoreToProps<RootState, RouteComponentProps, ContainerProps>;

export const mapStoreToContainerProps: MapStoreToContainerProps = (store, ownProps) => {
  return { ...store.getState(), ...ownProps, update: store.update };
};
