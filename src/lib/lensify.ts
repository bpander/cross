import { Lens, LensImpl } from 'lib/lens';

export type LensMap<T, U = T> = {
  [K in keyof U]: LensImpl<T, U[K]>;
};

// TODO: See if this can be gotten rid of
interface Lensish<T, U> {
  get: Lens<T, U>['get'];
  set: Lens<T, U>['set'];
  k: Lens<T, U>['k'];
}

interface GetChildLenses<T, U> {
  (l: LensImpl<T, U>): LensMap<T, U>;
}

interface Lensify {
  <T, U>(l: LensImpl<T, U>, f: GetChildLenses<T, U>): Lensish<T, U> & LensMap<T, U>;
}

// TODO: Seriously get rid of LensImpl
// tslint:disable no-any
const lensify: Lensify = (l, getChildLenses) => ({
  get: l.get.bind(l) as any,
  set: l.set.bind(l) as any,
  k: (l.k as any).bind(l) as any,
  ...getChildLenses(l),
});
// tslint:disable no-any

export default lensify;
