import { Lens } from 'lib/lens';

export type LensMap<T, U = T> = {
  [K in keyof U]: Lens<T, U[K]>;
};

interface GetChildLenses<T, U> {
  (l: Lens<T, U>): LensMap<T, U>;
}

interface Lensify {
  <T, U>(l: Lens<T, U>, f: GetChildLenses<T, U>): Lens<T, U> & LensMap<T, U>;
}

// TODO: Seriously get rid of Lens
// tslint:disable no-any
const lensify: Lensify = (l, getChildLenses) => ({
  ...l,
  ...getChildLenses(l),
});
// tslint:disable no-any

export default lensify;
