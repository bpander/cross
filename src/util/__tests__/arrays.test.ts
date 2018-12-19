import { times } from 'util/arrays';

it('returns an array with the same length', () => {
  expect(times(4, i => i)).toHaveLength(4);
});
